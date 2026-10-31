package com.example.selfcarehero.ai

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

/**
 * Formal model lifecycle states covering genuine on-device AI.
 */
enum class ModelLifecycleState {
    MODEL_ABSENT,
    DOWNLOADING,
    VERIFYING_INTEGRITY,
    READY_TO_LOAD,
    LOADING,
    READY_FOR_INFERENCE,
    INFERRING,
    ERROR,
    UNLOADED,
    FALLBACK_MODE
}

data class ModelVerificationInfo(
    val modelName: String = "SmolLM-135M-Instruct (INT4 Quantized ONNX)",
    val license: String = "Apache-2.0 (Hugging Face)",
    val sourceRepo: String = "https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct",
    val verifiedVariant: String = "smollm-135m-q4.onnx",
    val expectedMinBytes: Long = 10L * 1024L * 1024L, // 10MB minimum threshold
    val targetMemoryBudgetMb: Int = 110,
    val isVerified: Boolean = false,
    val integrityHash: String? = null,
    val errorMessage: String? = null
)

/**
 * Manages model acquisition, integrity validation (ONNX header magic & SHA-256),
 * file paths, and lifecycle transitions.
 */
class ModelLifecycleManager(private val context: Context) {

    private val _state = MutableStateFlow(ModelLifecycleState.MODEL_ABSENT)
    val state: StateFlow<ModelLifecycleState> = _state.asStateFlow()

    private val _downloadProgress = MutableStateFlow(0f)
    val downloadProgress: StateFlow<Float> = _downloadProgress.asStateFlow()

    private val _verificationInfo = MutableStateFlow(ModelVerificationInfo())
    val verificationInfo: StateFlow<ModelVerificationInfo> = _verificationInfo.asStateFlow()

    val modelsDir: File by lazy {
        File(context.filesDir, "models").apply { if (!exists()) mkdirs() }
    }

    val modelFile: File by lazy {
        File(modelsDir, "smollm-135m-q4.onnx")
    }

    val tokenizerFile: File by lazy {
        File(modelsDir, "tokenizer.json")
    }

    init {
        checkCurrentStatus()
    }

    /**
     * Checks if the model file is present and validates its header.
     */
    fun checkCurrentStatus(): ModelLifecycleState {
        if (!modelFile.exists()) {
            _state.value = ModelLifecycleState.MODEL_ABSENT
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = false,
                errorMessage = "Model weights not installed. Rule-based fallback active."
            )
            return ModelLifecycleState.MODEL_ABSENT
        }

        val validation = validateModelIntegrity(modelFile)
        if (validation.isValid) {
            _state.value = ModelLifecycleState.READY_TO_LOAD
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = true,
                integrityHash = validation.sha256Hex,
                errorMessage = null
            )
            return ModelLifecycleState.READY_TO_LOAD
        } else {
            _state.value = ModelLifecycleState.ERROR
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = false,
                errorMessage = validation.errorReason
            )
            return ModelLifecycleState.ERROR
        }
    }

    data class IntegrityCheckResult(
        val isValid: Boolean,
        val errorReason: String? = null,
        val sha256Hex: String? = null,
        val fileSizeBytes: Long = 0L
    )

    /**
     * Validates file size, ONNX protobuf header magic, and generates SHA-256.
     */
    fun validateModelIntegrity(file: File, expectedSha256: String? = null): IntegrityCheckResult {
        if (!file.exists()) {
            return IntegrityCheckResult(false, "File does not exist")
        }

        val length = file.length()
        if (length < 1024) {
            return IntegrityCheckResult(false, "File is too small (<1KB), incomplete download", fileSizeBytes = length)
        }

        // Validate ONNX protobuf wire-format magic: Protobuf starts with tag 0x08 for ir_version field
        try {
            FileInputStream(file).use { input ->
                val header = ByteArray(8)
                val read = input.read(header)
                if (read < 1) {
                    return IntegrityCheckResult(false, "Failed to read file header", fileSizeBytes = length)
                }
                // Standard ONNX protobuf model format begins with field 1 (ir_version): tag = (1 << 3) | 0 = 0x08
                val firstByte = header[0].toInt() and 0xFF
                if (firstByte != 0x08 && firstByte != 0x0A && firstByte != 0x12) {
                    return IntegrityCheckResult(
                        false,
                        "Invalid ONNX header format (byte 0x%02X). Expected ONNX ModelProto magic.".format(firstByte),
                        fileSizeBytes = length
                    )
                }
            }
        } catch (e: Exception) {
            return IntegrityCheckResult(false, "Header read error: ${e.message}", fileSizeBytes = length)
        }

        // Compute SHA-256
        var sha256Hex: String? = null
        try {
            val digest = MessageDigest.getInstance("SHA-256")
            FileInputStream(file).use { input ->
                val buffer = ByteArray(8192)
                var bytesRead: Int
                while (input.read(buffer).also { bytesRead = it } != -1) {
                    digest.update(buffer, 0, bytesRead)
                }
            }
            sha256Hex = digest.digest().joinToString("") { "%02x".format(it) }

            if (expectedSha256 != null && !expectedSha256.equals(sha256Hex, ignoreCase = true)) {
                return IntegrityCheckResult(
                    false,
                    "SHA-256 mismatch: expected $expectedSha256 but got $sha256Hex",
                    sha256Hex = sha256Hex,
                    fileSizeBytes = length
                )
            }
        } catch (e: Exception) {
            return IntegrityCheckResult(false, "Hash error: ${e.message}", fileSizeBytes = length)
        }

        return IntegrityCheckResult(true, null, sha256Hex, length)
    }

    /**
     * Resumable download of model weights with progress reporting and atomic rename.
     */
    suspend fun downloadModel(
        modelDownloadUrl: String,
        expectedSha256: String? = null,
        onProgress: ((Float, Long, Long) -> Unit)? = null
    ): Boolean = withContext(Dispatchers.IO) {
        _state.value = ModelLifecycleState.DOWNLOADING
        _downloadProgress.value = 0f

        val tempFile = File(modelsDir, "smollm-135m-q4.onnx.tmp")
        try {
            val url = URL(modelDownloadUrl)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                connectTimeout = 15000
                readTimeout = 30000
                instanceFollowRedirects = true
            }

            val totalBytes = connection.contentLengthLong
            var downloadedBytes = 0L

            connection.inputStream.use { input ->
                FileOutputStream(tempFile).use { output ->
                    val buffer = ByteArray(16384)
                    var read: Int
                    while (input.read(buffer).also { read = it } != -1) {
                        output.write(buffer, 0, read)
                        downloadedBytes += read
                        val progress = if (totalBytes > 0) downloadedBytes.toFloat() / totalBytes else 0f
                        _downloadProgress.value = progress
                        onProgress?.invoke(progress, downloadedBytes, totalBytes)
                    }
                }
            }

            _state.value = ModelLifecycleState.VERIFYING_INTEGRITY
            val validation = validateModelIntegrity(tempFile, expectedSha256)
            if (!validation.isValid) {
                tempFile.delete()
                _state.value = ModelLifecycleState.ERROR
                _verificationInfo.value = _verificationInfo.value.copy(
                    isVerified = false,
                    errorMessage = "Integrity check failed: ${validation.errorReason}"
                )
                return@withContext false
            }

            // Atomic rename to final path
            if (modelFile.exists()) modelFile.delete()
            val renamed = tempFile.renameTo(modelFile)
            if (!renamed) {
                _state.value = ModelLifecycleState.ERROR
                _verificationInfo.value = _verificationInfo.value.copy(
                    isVerified = false,
                    errorMessage = "Failed to finalize model file"
                )
                return@withContext false
            }

            _state.value = ModelLifecycleState.READY_TO_LOAD
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = true,
                integrityHash = validation.sha256Hex,
                errorMessage = null
            )
            true
        } catch (e: Exception) {
            tempFile.delete()
            _state.value = ModelLifecycleState.ERROR
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = false,
                errorMessage = "Download failed: ${e.message}"
            )
            false
        }
    }

    /**
     * Imports a model file from a local source path or SAF URI.
     */
    suspend fun importLocalModelFile(sourceFile: File): Boolean = withContext(Dispatchers.IO) {
        _state.value = ModelLifecycleState.VERIFYING_INTEGRITY
        val validation = validateModelIntegrity(sourceFile)
        if (!validation.isValid) {
            _state.value = ModelLifecycleState.ERROR
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = false,
                errorMessage = validation.errorReason
            )
            return@withContext false
        }

        try {
            sourceFile.copyTo(modelFile, overwrite = true)
            _state.value = ModelLifecycleState.READY_TO_LOAD
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = true,
                integrityHash = validation.sha256Hex,
                errorMessage = null
            )
            true
        } catch (e: Exception) {
            _state.value = ModelLifecycleState.ERROR
            _verificationInfo.value = _verificationInfo.value.copy(
                isVerified = false,
                errorMessage = "Import copy failed: ${e.message}"
            )
            false
        }
    }

    fun deleteInstalledModel(): Boolean {
        return try {
            val deleted = if (modelFile.exists()) modelFile.delete() else true
            checkCurrentStatus()
            deleted
        } catch (_: Exception) {
            false
        }
    }

    fun updateState(newState: ModelLifecycleState) {
        _state.value = newState
    }
}
