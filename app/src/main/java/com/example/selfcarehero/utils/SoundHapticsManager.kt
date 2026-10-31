package com.example.selfcarehero.utils

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.sin

/**
 * Sound & Haptic Feedback Manager for Self-Care Hero.
 * Uses lightweight programmatic PCM tone synthesis (zero asset weight) and
 * calibrated vibration patterns to create positive neuro-sensory feedback loops.
 */
class SoundHapticsManager(private val context: Context) {
    private val scope = CoroutineScope(Dispatchers.Default)

    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
        vibratorManager?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    var isSoundEnabled: Boolean = true
    var isHapticsEnabled: Boolean = true

    enum class SoundType {
        CHECK_HABIT,      // Soft ascending dual-tone (C5 -> E5)
        INCREMENT_COUNT,  // Crisp tap chime
        DAILY_THREE_WIN,  // Celebratory golden arpeggio (C5 -> E5 -> G5 -> C6)
        LEVEL_UP,         // Grand multi-tone fanfare
        FOCUS_BELL,       // Calming meditative bowl tone (440Hz with long decay)
        COIN_REWARD,      // Bright double chime
        URGE_CALM,        // Low grounding resonance (174Hz)
        CLICK,            // UI click tone
        DECREMENT_COUNT   // Decrement tick
    }

    enum class HapticType {
        LIGHT_CLICK,
        LIGHT_TICK,
        MEDIUM_PULSE,
        CELEBRATION_BURST,
        CALM_WAVE
    }

    fun play(sound: SoundType, haptic: HapticType? = null) {
        if (isHapticsEnabled && haptic != null) {
            triggerHaptic(haptic)
        }
        if (isSoundEnabled) {
            scope.launch {
                generateAndPlayTone(sound)
            }
        }
    }

    fun triggerHaptic(type: HapticType) {
        if (!isHapticsEnabled || vibrator == null || !vibrator.hasVibrator()) return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                when (type) {
                    HapticType.LIGHT_CLICK, HapticType.LIGHT_TICK -> {
                        vibrator.vibrate(VibrationEffect.createOneShot(18, 70))
                    }
                    HapticType.MEDIUM_PULSE -> {
                        vibrator.vibrate(VibrationEffect.createOneShot(32, 140))
                    }
                    HapticType.CELEBRATION_BURST -> {
                        // Triple pulse pattern: wait, pulse, wait, pulse, wait, longer pulse
                        val timings = longArrayOf(0, 30, 50, 35, 50, 60)
                        val amplitudes = intArrayOf(0, 100, 0, 150, 0, 220)
                        vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                    }
                    HapticType.CALM_WAVE -> {
                        vibrator.vibrate(VibrationEffect.createOneShot(45, 60))
                    }
                }
            } else {
                @Suppress("DEPRECATION")
                when (type) {
                    HapticType.LIGHT_CLICK, HapticType.LIGHT_TICK -> vibrator.vibrate(18)
                    HapticType.MEDIUM_PULSE -> vibrator.vibrate(32)
                    HapticType.CELEBRATION_BURST -> vibrator.vibrate(longArrayOf(0, 30, 50, 35, 50, 60), -1)
                    HapticType.CALM_WAVE -> vibrator.vibrate(45)
                }
            }
        } catch (_: Exception) {
            // Graceful fallback if device restricts vibration
        }
    }

    private fun generateAndPlayTone(type: SoundType) {
        val sampleRate = 44100
        val frequencies: List<Pair<Double, Double>> = when (type) {
            // Pairs of (Frequency in Hz, Duration in seconds)
            SoundType.CHECK_HABIT -> listOf(523.25 to 0.08, 659.25 to 0.16) // C5 -> E5
            SoundType.INCREMENT_COUNT, SoundType.CLICK -> listOf(783.99 to 0.09) // G5
            SoundType.DECREMENT_COUNT -> listOf(587.33 to 0.08, 523.25 to 0.10) // D5 -> C5
            SoundType.DAILY_THREE_WIN -> listOf(523.25 to 0.09, 659.25 to 0.09, 783.99 to 0.11, 1046.50 to 0.28) // C5-E5-G5-C6
            SoundType.LEVEL_UP -> listOf(440.0 to 0.08, 554.37 to 0.08, 659.25 to 0.10, 880.0 to 0.35) // A4-C#5-E5-A5
            SoundType.FOCUS_BELL -> listOf(329.63 to 0.45) // E4 mellow gong
            SoundType.COIN_REWARD -> listOf(987.77 to 0.06, 1318.51 to 0.14) // B5 -> E6
            SoundType.URGE_CALM -> listOf(174.61 to 0.50) // F3 low grounding drone
        }

        val totalDuration = frequencies.sumOf { it.second }
        val totalSamples = (totalDuration * sampleRate).toInt()
        val buffer = ShortArray(totalSamples)

        var sampleIndex = 0
        for ((freq, duration) in frequencies) {
            val segmentSamples = (duration * sampleRate).toInt()
            for (i in 0 until segmentSamples) {
                if (sampleIndex >= totalSamples) break
                // ADSR envelope: smooth attack & exponential decay to prevent clicks/pops
                val progress = i.toDouble() / segmentSamples
                val envelope = when {
                    progress < 0.15 -> progress / 0.15 // Fast smooth attack
                    else -> (1.0 - progress) * (1.0 - progress) // Exponential decay
                }
                val angle = 2.0 * PI * i * freq / sampleRate
                val sampleValue = (sin(angle) * envelope * 22000.0).toInt().coerceIn(-32768, 32767)
                buffer[sampleIndex++] = sampleValue.toShort()
            }
        }

        try {
            val track = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                        .build()
                )
                .setBufferSizeInBytes(buffer.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()

            track.write(buffer, 0, buffer.size)
            track.play()
            // Clean up track after tone finishes
            scope.launch {
                kotlinx.coroutines.delay((totalDuration * 1000 + 100).toLong())
                track.stop()
                track.release()
            }
        } catch (_: Exception) {
            // Graceful fallback if audio device is unavailable
        }
    }
}
