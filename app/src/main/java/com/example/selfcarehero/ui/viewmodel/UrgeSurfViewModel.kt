package com.example.selfcarehero.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.selfcarehero.data.UrgeSurfRepository
import com.example.selfcarehero.data.room.PostSurfOutcome
import com.example.selfcarehero.data.room.SomaticPacerMode
import com.example.selfcarehero.data.room.SurfOutcome
import com.example.selfcarehero.data.room.UrgeLogEntity
import com.example.selfcarehero.data.room.UrgeSession
import com.example.selfcarehero.utils.SoundHapticsManager
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class UrgeScreenStep {
    ONSET,
    WAVE_PACER,
    RESOLUTION
}

enum class PacerPhase(val label: String, val instruction: String) {
    INHALE("Inhale", "Breathe in deeply through your nose"),
    TOP_UP_INHALE("Quick Inhale", "Take a second top-up sip of air"),
    HOLD_FULL("Hold", "Gently hold and feel the still expansion"),
    EXHALE("Exhale", "Slowly sigh the breath out through your mouth"),
    HOLD_EMPTY("Hold", "Rest peacefully in the quiet pause")
}

class UrgeSurfViewModel(
    private val repository: UrgeSurfRepository,
    private val soundHaptics: SoundHapticsManager? = null
) : ViewModel() {

    private val _currentStep = MutableStateFlow(UrgeScreenStep.ONSET)
    val currentStep: StateFlow<UrgeScreenStep> = _currentStep.asStateFlow()

    private val _session = MutableStateFlow(UrgeSession())
    val session: StateFlow<UrgeSession> = _session.asStateFlow()

    // 10-Minute Wave Countdown
    val totalSeconds = 600
    private val _secondsRemaining = MutableStateFlow(totalSeconds)
    val secondsRemaining: StateFlow<Int> = _secondsRemaining.asStateFlow()

    private val _isTimerRunning = MutableStateFlow(false)
    val isTimerRunning: StateFlow<Boolean> = _isTimerRunning.asStateFlow()

    // Somatic Breath Pacing
    private val _pacerPhase = MutableStateFlow(PacerPhase.INHALE)
    val pacerPhase: StateFlow<PacerPhase> = _pacerPhase.asStateFlow()

    private val _pacerProgress = MutableStateFlow(0f)
    val pacerProgress: StateFlow<Float> = _pacerProgress.asStateFlow()

    // Post-Surf Resolution
    private val _postOutcome = MutableStateFlow<PostSurfOutcome?>(null)
    val postOutcome: StateFlow<PostSurfOutcome?> = _postOutcome.asStateFlow()

    // Room Database Observables
    val recentLogs: StateFlow<List<UrgeLogEntity>> = repository.allUrgeLogs
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val surfedCount: StateFlow<Int> = repository.surfedCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val avgIntensityDrop: StateFlow<Double?> = repository.avgIntensityDrop
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    private var timerJob: Job? = null
    private var breathJob: Job? = null

    // Setup Methods
    fun updateTrigger(newTrigger: String) {
        _session.value = _session.value.copy(trigger = newTrigger)
    }

    fun updatePreIntensity(value: Int) {
        _session.value = _session.value.copy(preIntensity = value)
    }

    fun updateWant(text: String) {
        _session.value = _session.value.copy(want = text)
    }

    fun updateChoice(text: String) {
        _session.value = _session.value.copy(choice = text)
    }

    fun toggleSomaticTag(tag: String) {
        val current = _session.value.somaticSensations.toMutableList()
        if (current.contains(tag)) {
            current.remove(tag)
        } else {
            current.add(tag)
        }
        _session.value = _session.value.copy(somaticSensations = current)
    }

    fun toggleContextTag(tag: String) {
        val current = _session.value.contextTags.toMutableList()
        if (current.contains(tag)) {
            current.remove(tag)
        } else {
            current.add(tag)
        }
        _session.value = _session.value.copy(contextTags = current)
    }

    fun setPacingMode(mode: SomaticPacerMode) {
        _session.value = _session.value.copy(pacingMode = mode)
        restartBreathCycle()
    }

    fun startWave() {
        _currentStep.value = UrgeScreenStep.WAVE_PACER
        _secondsRemaining.value = totalSeconds
        _isTimerRunning.value = true
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        startTimerLoop()
        startBreathCycle()
    }

    fun toggleTimer() {
        _isTimerRunning.value = !_isTimerRunning.value
        soundHaptics?.play(SoundHapticsManager.SoundType.INCREMENT_COUNT, SoundHapticsManager.HapticType.LIGHT_CLICK)
        if (_isTimerRunning.value) {
            startTimerLoop()
            startBreathCycle()
        } else {
            timerJob?.cancel()
            breathJob?.cancel()
        }
    }

    fun onEarlySubside() {
        soundHaptics?.play(SoundHapticsManager.SoundType.URGE_CALM, SoundHapticsManager.HapticType.CALM_WAVE)
        stopLoops()
        prepareOutcome(
            outcome = SurfOutcome.SURFED,
            defaultPost = (_session.value.preIntensity / 2).coerceAtLeast(1)
        )
    }

    fun onStepOut(outcome: SurfOutcome = SurfOutcome.RESISTED) {
        soundHaptics?.play(SoundHapticsManager.SoundType.CHECK_HABIT, SoundHapticsManager.HapticType.MEDIUM_PULSE)
        stopLoops()
        prepareOutcome(
            outcome = outcome,
            defaultPost = _session.value.preIntensity
        )
    }

    private fun stopLoops() {
        _isTimerRunning.value = false
        timerJob?.cancel()
        breathJob?.cancel()
    }

    private fun startTimerLoop() {
        timerJob?.cancel()
        timerJob = viewModelScope.launch {
            while (_isTimerRunning.value && _secondsRemaining.value > 0) {
                delay(1000L)
                _secondsRemaining.value -= 1
                if (_secondsRemaining.value == 0) {
                    _isTimerRunning.value = false
                    soundHaptics?.play(SoundHapticsManager.SoundType.DAILY_THREE_WIN, SoundHapticsManager.HapticType.CELEBRATION_BURST)
                    prepareOutcome(
                        outcome = SurfOutcome.SURFED,
                        defaultPost = (_session.value.preIntensity / 2).coerceAtLeast(1)
                    )
                }
            }
        }
    }

    private fun restartBreathCycle() {
        if (_isTimerRunning.value && _currentStep.value == UrgeScreenStep.WAVE_PACER) {
            startBreathCycle()
        }
    }

    private fun startBreathCycle() {
        breathJob?.cancel()
        breathJob = viewModelScope.launch {
            while (_isTimerRunning.value) {
                when (_session.value.pacingMode) {
                    SomaticPacerMode.BOX_BREATHING -> {
                        // 4-4-4-4
                        runPhase(PacerPhase.INHALE, 4000L)
                        runPhase(PacerPhase.HOLD_FULL, 4000L)
                        runPhase(PacerPhase.EXHALE, 4000L)
                        runPhase(PacerPhase.HOLD_EMPTY, 4000L)
                    }
                    SomaticPacerMode.BREATH_478 -> {
                        // 4-7-8
                        runPhase(PacerPhase.INHALE, 4000L)
                        runPhase(PacerPhase.HOLD_FULL, 7000L)
                        runPhase(PacerPhase.EXHALE, 8000L)
                    }
                    SomaticPacerMode.PHYSIOLOGICAL_SIGH -> {
                        // 2s Inhale -> 1s Top-up Inhale -> 5s Exhale
                        runPhase(PacerPhase.INHALE, 2000L)
                        runPhase(PacerPhase.TOP_UP_INHALE, 1200L)
                        runPhase(PacerPhase.EXHALE, 5500L)
                    }
                }
            }
        }
    }

    private suspend fun runPhase(phase: PacerPhase, durationMs: Long) {
        _pacerPhase.value = phase
        val stepMs = 50L
        val steps = (durationMs / stepMs).toInt()
        for (i in 0..steps) {
            if (!_isTimerRunning.value) break
            _pacerProgress.value = i.toFloat() / steps.toFloat()
            delay(stepMs)
        }
    }

    private fun prepareOutcome(outcome: SurfOutcome, defaultPost: Int) {
        viewModelScope.launch {
            val delta = maxOf(0, _session.value.preIntensity - defaultPost)
            val (coins, xp) = repository.calculateRewards(_session.value.preIntensity, defaultPost, outcome)
            _postOutcome.value = PostSurfOutcome(
                postIntensity = defaultPost,
                outcomeClassification = outcome,
                intensityDelta = delta,
                coinsEarned = coins,
                xpEarned = xp
            )
            _currentStep.value = UrgeScreenStep.RESOLUTION
        }
    }

    fun updatePostIntensity(value: Int) {
        val current = _postOutcome.value ?: return
        viewModelScope.launch {
            val delta = maxOf(0, _session.value.preIntensity - value)
            val (coins, xp) = repository.calculateRewards(_session.value.preIntensity, value, current.outcomeClassification)
            _postOutcome.value = current.copy(
                postIntensity = value,
                intensityDelta = delta,
                coinsEarned = coins,
                xpEarned = xp
            )
        }
    }

    fun updateOutcomeClassification(outcome: SurfOutcome) {
        val current = _postOutcome.value ?: return
        viewModelScope.launch {
            val (coins, xp) = repository.calculateRewards(_session.value.preIntensity, current.postIntensity, outcome)
            _postOutcome.value = current.copy(
                outcomeClassification = outcome,
                coinsEarned = coins,
                xpEarned = xp
            )
        }
    }

    fun updateReflectionNote(note: String) {
        _postOutcome.value = _postOutcome.value?.copy(reflectionNote = note)
    }

    fun saveAndFinish(onComplete: () -> Unit) {
        val outcome = _postOutcome.value ?: return
        viewModelScope.launch {
            repository.saveSession(_session.value, outcome)
            soundHaptics?.play(SoundHapticsManager.SoundType.COIN_REWARD, SoundHapticsManager.HapticType.MEDIUM_PULSE)
            // Reset for next session
            _session.value = UrgeSession()
            _currentStep.value = UrgeScreenStep.ONSET
            _postOutcome.value = null
            _secondsRemaining.value = totalSeconds
            onComplete()
        }
    }

    fun cancelAndExit(onComplete: () -> Unit) {
        stopLoops()
        _currentStep.value = UrgeScreenStep.ONSET
        _postOutcome.value = null
        onComplete()
    }
}
