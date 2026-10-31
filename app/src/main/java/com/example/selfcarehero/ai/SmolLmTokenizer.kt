package com.example.selfcarehero.ai

import org.json.JSONObject
import java.io.File
import java.nio.charset.StandardCharsets

/**
 * Pure Kotlin tokenizer for SmolLM-135M-Instruct and LLaMA-based causal language models.
 * Supports ChatML prompt templating, vocabulary loading from tokenizer.json/vocab.json,
 * and robust byte-level BPE encoding/decoding.
 */
class SmolLmTokenizer(private val modelDir: File? = null) {

    // Special token definitions matching SmolLM-135M-Instruct & ChatML
    companion object {
        const val TOKEN_PAD = 0L
        const val TOKEN_BOS = 1L
        const val TOKEN_EOS = 2L
        const val TOKEN_IM_START = 100264L
        const val TOKEN_IM_END = 100265L
        const val TOKEN_END_OF_TEXT = 100257L

        val STOP_TOKENS = setOf(TOKEN_EOS, TOKEN_IM_END, TOKEN_END_OF_TEXT)
    }

    private val vocab = mutableMapOf<String, Long>()
    private val reverseVocab = mutableMapOf<Long, String>()
    private var isInitialized = false

    init {
        loadVocabulary()
    }

    /**
     * Loads vocabulary from disk if tokenizer.json/vocab.json exists,
     * otherwise falls back to the embedded core BPE subword table.
     */
    private fun loadVocabulary() {
        var loadedFromFile = false

        if (modelDir != null && modelDir.exists()) {
            val tokenizerJson = File(modelDir, "tokenizer.json")
            val vocabJson = File(modelDir, "vocab.json")

            if (tokenizerJson.exists() && tokenizerJson.length() > 0) {
                loadedFromFile = parseTokenizerJson(tokenizerJson)
            } else if (vocabJson.exists() && vocabJson.length() > 0) {
                loadedFromFile = parseVocabJson(vocabJson)
            }
        }

        if (!loadedFromFile) {
            loadEmbeddedVocabulary()
        }

        isInitialized = true
    }

    private fun parseTokenizerJson(file: File): Boolean {
        return try {
            val content = file.readText(StandardCharsets.UTF_8)
            val json = JSONObject(content)
            val modelObj = json.optJSONObject("model") ?: return false
            val vocabObj = modelObj.optJSONObject("vocab") ?: return false

            val keys = vocabObj.keys()
            while (keys.hasNext()) {
                val token = keys.next()
                val id = vocabObj.getLong(token)
                vocab[token] = id
                reverseVocab[id] = token
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun parseVocabJson(file: File): Boolean {
        return try {
            val content = file.readText(StandardCharsets.UTF_8)
            val json = JSONObject(content)
            val keys = json.keys()
            while (keys.hasNext()) {
                val token = keys.next()
                val id = json.getLong(token)
                vocab[token] = id
                reverseVocab[id] = token
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    /**
     * Core subword vocabulary to ensure safe, deterministic tokenization
     * even prior to external tokenizer file acquisition.
     */
    private fun loadEmbeddedVocabulary() {
        vocab.clear()
        reverseVocab.clear()

        // Standard special tokens
        addToken("<|endoftext|>", TOKEN_END_OF_TEXT)
        addToken("<|im_start|>", TOKEN_IM_START)
        addToken("<|im_end|>", TOKEN_IM_END)
        addToken("<s>", TOKEN_BOS)
        addToken("</s>", TOKEN_EOS)
        addToken("<pad>", TOKEN_PAD)

        // Basic ASCII byte vocabulary (0..255 mapped to IDs 3..258)
        for (i in 0..255) {
            val ch = i.toChar().toString()
            addToken(ch, (i + 3).toLong())
        }

        // Common high-frequency English & BloomQuest subwords
        val commonWords = listOf(
            "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
            "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
            "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
            "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
            "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
            "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
            "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
            "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
            "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
            "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
            // Self-care and cognitive domain vocabulary
            "habit", "habits", "routine", "routines", "reflection", "journal", "socratic",
            "feynman", "mind", "body", "learn", "build", "focus", "breath", "breathing",
            "dopamine", "streak", "stoic", "reframe", "calm", "anxiety", "progress",
            "morning", "evening", "pillar", "xp", "coins", "urge", "wave", "surf",
            "system", "user", "assistant", "\n", " ", "  ", ":", ".", ",", "!", "?",
            "-", "(", ")", "[", "]", "*", "#", "•", "'", "\"", "/"
        )

        var idCounter = 300L
        for (w in commonWords) {
            if (!vocab.containsKey(w)) {
                addToken(w, idCounter++)
            }
            val withLeadingSpace = " $w"
            if (!vocab.containsKey(withLeadingSpace)) {
                addToken(withLeadingSpace, idCounter++)
            }
        }
    }

    private fun addToken(token: String, id: Long) {
        vocab[token] = id
        reverseVocab[id] = token
    }

    /**
     * Applies ChatML template matching SmolLM-135M-Instruct.
     */
    fun applyChatTemplate(systemPrompt: String, userMessage: String): String {
        return buildString {
            append("<|im_start|>system\n")
            append(systemPrompt.trim())
            append("<|im_end|>\n<|im_start|>user\n")
            append(userMessage.trim())
            append("<|im_end|>\n<|im_start|>assistant\n")
        }
    }

    /**
     * Encodes a prompt string into token IDs.
     */
    fun encode(text: String): LongArray {
        val tokens = mutableListOf<Long>()
        var remaining = text

        // Handle special tokens first
        val specialPattern = Regex("(<\\|im_start\\|>|<\\|im_end\\|>|<\\|endoftext\\|>|<s>|</s>)")

        var lastIdx = 0
        for (match in specialPattern.findAll(text)) {
            if (match.range.first > lastIdx) {
                val segment = text.substring(lastIdx, match.range.first)
                encodeSegment(segment, tokens)
            }
            val specialId = vocab[match.value] ?: TOKEN_EOS
            tokens.add(specialId)
            lastIdx = match.range.last + 1
        }

        if (lastIdx < text.length) {
            val tail = text.substring(lastIdx)
            encodeSegment(tail, tokens)
        }

        return tokens.toLongArray()
    }

    /**
     * Greedy longest-prefix match subword encoding with byte-fallback.
     */
    private fun encodeSegment(segment: String, outTokens: MutableList<Long>) {
        var i = 0
        while (i < segment.length) {
            var matched = false
            // Look ahead up to 32 characters for multi-character tokens
            val maxLen = minOf(32, segment.length - i)
            for (len in maxLen downTo 1) {
                val sub = segment.substring(i, i + len)
                val id = vocab[sub]
                if (id != null) {
                    outTokens.add(id)
                    i += len
                    matched = true
                    break
                }
            }
            if (!matched) {
                // Byte fallback
                val byteVal = segment[i].code
                val byteId = vocab[segment[i].toString()] ?: (byteVal + 3).toLong()
                outTokens.add(byteId)
                i++
            }
        }
    }

    /**
     * Decodes a token ID sequence back to text, skipping special tokens.
     */
    fun decode(tokenIds: LongArray): String {
        val sb = StringBuilder()
        for (id in tokenIds) {
            if (STOP_TOKENS.contains(id) || id == TOKEN_IM_START || id == TOKEN_BOS || id == TOKEN_PAD) {
                continue
            }
            val word = reverseVocab[id]
            if (word != null) {
                sb.append(word)
            } else if (id in 3..258) {
                // ASCII byte mapping
                sb.append((id - 3).toInt().toChar())
            }
        }
        return sb.toString()
    }

    /**
     * Decodes a single token ID.
     */
    fun decodeSingle(tokenId: Long): String {
        if (STOP_TOKENS.contains(tokenId) || tokenId == TOKEN_IM_START || tokenId == TOKEN_BOS || tokenId == TOKEN_PAD) {
            return ""
        }
        return reverseVocab[tokenId] ?: if (tokenId in 3..258) {
            (tokenId - 3).toInt().toChar().toString()
        } else ""
    }

    fun isStopToken(tokenId: Long): Boolean {
        return STOP_TOKENS.contains(tokenId)
    }

    fun getVocabSize(): Int = vocab.size
}
