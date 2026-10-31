package com.example.selfcarehero.utils

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.*
import java.util.Random
import kotlin.math.*

enum class SoundscapeType(val label: String, val icon: String, val description: String) {
    BROWN_NOISE("Deep Brown Noise", "📻", "Low-frequency rumble for deep work and ADHD calming"),
    FOREST_RAIN("Forest Rain", "🌧️", "Gentle drops through canopy leaves"),
    WARM_HEARTH("Warm Hearth", "🔥", "Soft crackle and ember warmth"),
    SINGING_BOWLS("Tibetan Bowls", "🔔", "Harmonic singing bowls with calming resonance"),
    OFF("Mute", "🔇", "Silence")
}

object SoundscapeEngine {
    private const val SAMPLE_RATE = 22050 // Optimized for low CPU on mid-range devices like Samsung M31s
    private const val BUFFER_SIZE = 4096

    private var audioTrack: AudioTrack? = null
    private var soundJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    var currentSoundscape: SoundscapeType = SoundscapeType.OFF
        private set
    var volume: Float = 0.65f
        private set

    fun setVolumeLevel(vol: Float) {
        volume = vol.coerceIn(0f, 1f)
        try {
            audioTrack?.setVolume(volume)
        } catch (_: Exception) {}
    }

    fun play(type: SoundscapeType) {
        if (currentSoundscape == type && soundJob?.isActive == true) return
        stop()
        if (type == SoundscapeType.OFF) return

        currentSoundscape = type
        soundJob = scope.launch {
            try {
                val minBufSize = AudioTrack.getMinBufferSize(
                    SAMPLE_RATE,
                    AudioFormat.CHANNEL_OUT_MONO,
                    AudioFormat.ENCODING_PCM_16BIT
                )
                val bufferSizeInBytes = max(minBufSize, BUFFER_SIZE * 2)

                val track = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(SAMPLE_RATE)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(bufferSizeInBytes)
                    .setTransferMode(AudioTrack.MODE_STREAM)
                    .build()

                track.setVolume(volume)
                track.play()
                audioTrack = track

                val shortBuffer = ShortArray(BUFFER_SIZE)
                val random = Random()

                // State variables for procedural DSP filters
                var brownLast = 0.0
                var pinkB0 = 0.0
                var pinkB1 = 0.0
                var pinkB2 = 0.0
                var phase = 0.0

                while (isActive) {
                    for (i in 0 until BUFFER_SIZE) {
                        val sample: Double = when (type) {
                            SoundscapeType.BROWN_NOISE -> {
                                val white = (random.nextDouble() * 2.0) - 1.0
                                brownLast = (brownLast + (0.02 * white)) / 1.02
                                brownLast * 3.5
                            }
                            SoundscapeType.FOREST_RAIN -> {
                                val white = (random.nextDouble() * 2.0) - 1.0
                                // Pink filter
                                pinkB0 = 0.99886 * pinkB0 + white * 0.0555179
                                pinkB1 = 0.99332 * pinkB1 + white * 0.0750759
                                pinkB2 = 0.96900 * pinkB2 + white * 0.1538520
                                val pink = pinkB0 + pinkB1 + pinkB2 + white * 0.5362
                                val dropCrackle = if (random.nextDouble() < 0.015) (random.nextDouble() * 0.4) else 0.0
                                (pink * 0.18) + dropCrackle
                            }
                            SoundscapeType.WARM_HEARTH -> {
                                val white = (random.nextDouble() * 2.0) - 1.0
                                brownLast = (brownLast + (0.04 * white)) / 1.04
                                val pop = if (random.nextDouble() < 0.003) (random.nextDouble() * 0.7 - 0.35) else 0.0
                                (brownLast * 1.8) + pop
                            }
                            SoundscapeType.SINGING_BOWLS -> {
                                phase += 2.0 * Math.PI * 174.0 / SAMPLE_RATE // 174Hz Solfeggio / Root frequency
                                if (phase > 2.0 * Math.PI) phase -= 2.0 * Math.PI
                                val fundamental = sin(phase)
                                val harmonic = sin(phase * 2.0) * 0.4
                                val sub = sin(phase * 0.5) * 0.25
                                (fundamental + harmonic + sub) * 0.3
                            }
                            SoundscapeType.OFF -> 0.0
                        }

                        val clamped = sample.coerceIn(-1.0, 1.0)
                        shortBuffer[i] = (clamped * 32767.0).toInt().toShort()
                    }
                    track.write(shortBuffer, 0, BUFFER_SIZE)
                }
            } catch (_: CancellationException) {
                // Expected when stopped
            } catch (_: Exception) {}
        }
    }

    fun stop() {
        soundJob?.cancel()
        soundJob = null
        currentSoundscape = SoundscapeType.OFF
        try {
            audioTrack?.pause()
            audioTrack?.flush()
            audioTrack?.release()
        } catch (_: Exception) {}
        audioTrack = null
    }
}
