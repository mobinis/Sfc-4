package com.example.selfcarehero.utils

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.speech.RecognizerIntent
import android.speech.tts.TextToSpeech
import androidx.activity.compose.ManagedActivityResultLauncher
import androidx.activity.result.ActivityResult
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import java.util.Locale

object VideoTimeFormatter {
    fun formatMs(ms: Long): String {
        val totalSeconds = (ms / 1000).coerceAtLeast(0)
        val minutes = totalSeconds / 60
        val seconds = totalSeconds % 60
        val hours = minutes / 60
        return if (hours > 0) {
            val remMinutes = minutes % 60
            String.format(Locale.US, "%d:%02d:%02d", hours, remMinutes, seconds)
        } else {
            String.format(Locale.US, "%02d:%02d", minutes, seconds)
        }
    }
}

/**
 * Lifecycle-safe state holder for Android Text-to-Speech in Compose.
 */
@Composable
fun rememberTextToSpeechSpeaker(): NoteSpeaker {
    val context = LocalContext.current
    var ttsInstance by remember { mutableStateOf<TextToSpeech?>(null) }
    var isReady by remember { mutableStateOf(false) }

    DisposableEffect(context) {
        var tts: TextToSpeech? = null
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                tts?.language = Locale.getDefault()
                ttsInstance = tts
                isReady = true
            }
        }

        onDispose {
            ttsInstance?.stop()
            ttsInstance?.shutdown()
            ttsInstance = null
            isReady = false
        }
    }

    return remember(ttsInstance, isReady) {
        NoteSpeaker(
            speak = { text ->
                if (text.isNotBlank() && ttsInstance != null) {
                    val cleanText = text.replace(Regex("[\\[\\]\\*#_~]"), " ").trim()
                    ttsInstance?.speak(cleanText, TextToSpeech.QUEUE_FLUSH, null, "voice_note_${System.currentTimeMillis()}")
                }
            },
            stop = {
                ttsInstance?.stop()
            },
            isAvailable = isReady
        )
    }
}

class NoteSpeaker(
    val speak: (String) -> Unit,
    val stop: () -> Unit,
    val isAvailable: Boolean
)

/**
 * Launches Android Speech Recognizer dialog for voice note dictation.
 */
fun launchVoiceDictation(
    launcher: ManagedActivityResultLauncher<Intent, ActivityResult>,
    promptMessage: String = "Speak your note or insight..."
) {
    try {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PROMPT, promptMessage)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        launcher.launch(intent)
    } catch (_: Exception) {
        // Fallback gracefully on devices without speech recognition services
    }
}
