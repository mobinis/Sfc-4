package com.example.selfcarehero

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.data.FirestoreSyncRepository
import com.example.selfcarehero.data.SelfCareRepository
import com.example.selfcarehero.ui.components.HeaderBar
import com.example.selfcarehero.ui.dialogs.*
import com.example.selfcarehero.ui.screens.*
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import com.example.selfcarehero.ui.viewmodel.TabType
import com.example.selfcarehero.utils.SoundHapticsManager
import com.example.selfcarehero.data.UrgeSurfRepository
import com.example.selfcarehero.ui.viewmodel.UrgeSurfViewModel
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val repository = SelfCareRepository(applicationContext)
        val soundHaptics = SoundHapticsManager(applicationContext)
        val firestoreSync = FirestoreSyncRepository(applicationContext)
        val viewModel = SelfCareViewModel(repository, soundHaptics, firestoreSync)
        val urgeRepository = UrgeSurfRepository(applicationContext, repository)
        val urgeSurfViewModel = UrgeSurfViewModel(urgeRepository, soundHaptics)

        setContent {
            val state by viewModel.state.collectAsState()
            SelfCareHeroTheme(isDarkMode = state.isDarkMode) {
                MainApp(viewModel, urgeSurfViewModel)
            }
        }
    }
}

@Composable
fun MainApp(
    viewModel: SelfCareViewModel,
    urgeSurfViewModel: UrgeSurfViewModel
) {
    val currentTab by viewModel.currentTab.collectAsState()
    val state by viewModel.state.collectAsState()
    val toastMessage by viewModel.toast.collectAsState()
    val showUrgeScreen by viewModel.showUrgeSurfingScreen.collectAsState()
    val isPinUnlocked by viewModel.isPinSessionUnlocked.collectAsState()

    if (showUrgeScreen) {
        if (state.pinLockEnabled && state.lockUrges && !isPinUnlocked) {
            com.example.selfcarehero.ui.components.PinProtectedScreen(
                sectionName = "Urge Surfing Protocol",
                sectionIcon = "🌊",
                viewModel = viewModel,
                onDismiss = { viewModel.closeUrgeSurfingScreen() }
            )
        } else {
            UrgeSurfingScreen(
                viewModel = urgeSurfViewModel,
                onBack = { viewModel.closeUrgeSurfingScreen() }
            )
        }
    } else if (state.pinLockEnabled && state.lockAppLaunch && !isPinUnlocked) {
        com.example.selfcarehero.ui.components.PinProtectedScreen(
            sectionName = "BloomQuest",
            sectionIcon = "🛡️",
            viewModel = viewModel
        )
    } else {
        // Back handling: If on secondary tab, return to TODAY
        if (currentTab != TabType.TODAY) {
            BackHandler {
                viewModel.selectTab(TabType.TODAY)
            }
        }

        // Auto-dismiss toast
        LaunchedEffect(toastMessage) {
            if (toastMessage != null) {
                delay(2500L)
                viewModel.clearToast()
            }
        }

        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Column {
                Spacer(modifier = Modifier.windowInsetsTopHeight(WindowInsets.statusBars))
                HeaderBar(viewModel = viewModel)
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface,
                tonalElevation = 6.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("bottom_nav_bar")
            ) {
                TabType.entries.forEach { tab ->
                    val isSelected = currentTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.selectTab(tab) },
                        alwaysShowLabel = false,
                        icon = {
                            Text(
                                text = tab.iconEmoji,
                                fontSize = if (isSelected) 18.sp else 15.sp
                            )
                        },
                        label = {
                            Text(
                                text = tab.label,
                                fontSize = 9.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                            selectedTextColor = MaterialTheme.colorScheme.onSurface,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                        ),
                        modifier = Modifier.testTag("nav_tab_${tab.name.lowercase()}")
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Screen Switching with smooth transitions
            when (currentTab) {
                TabType.TODAY -> TodayScreen(viewModel = viewModel)
                TabType.SKILLS -> SkillsScreen(viewModel = viewModel)
                TabType.LEARN -> LearnScreen(viewModel = viewModel)
                TabType.VIDEOS -> VideoLibraryScreen(viewModel = viewModel)
                TabType.STUDY -> StudyScreen(viewModel = viewModel)
                TabType.JOURNAL -> {
                    if (state.pinLockEnabled && state.lockJournal && !isPinUnlocked) {
                        com.example.selfcarehero.ui.components.PinProtectedScreen(
                            sectionName = "Confidential Journal & Reflections",
                            sectionIcon = "✍️",
                            viewModel = viewModel
                        )
                    } else {
                        JournalScreen(viewModel = viewModel)
                    }
                }
                TabType.ALERTS -> AlertsScreen(viewModel = viewModel)
                TabType.STATS -> StatsScreen(viewModel = viewModel)
            }

            // Toast Floating Notification
            AnimatedVisibility(
                visible = toastMessage != null,
                enter = fadeIn() + slideInVertically(initialOffsetY = { -40 }),
                exit = fadeOut() + slideOutVertically(targetOffsetY = { -40 }),
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 16.dp)
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(PastelApricotAmber)
                        .padding(horizontal = 16.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = toastMessage ?: "",
                        color = LightTextEspresso,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp
                    )
                }
            }
        }
    }

    // Modal Overlays
    val showCloudSync by viewModel.showCloudSyncDialog.collectAsState()
    if (showCloudSync) {
        CloudSyncDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showCloudSyncDialog.value = false }
        )
    }

    val showEditNode by viewModel.showEditNodeDialog.collectAsState()
    val editingNode by viewModel.editingNode.collectAsState()
    if (showEditNode) {
        SkillEditDialog(
            node = editingNode,
            viewModel = viewModel,
            onDismiss = { viewModel.showEditNodeDialog.value = false }
        )
    }

    val showFocusTimer by viewModel.showFocusTimerDialog.collectAsState()
    if (showFocusTimer) {
        FocusTimerDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showFocusTimerDialog.value = false }
        )
    }

    val showUrge by viewModel.showUrgeDialog.collectAsState()
    if (showUrge) {
        UrgeSurfingDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showUrgeDialog.value = false }
        )
    }

    val showRewardShop by viewModel.showRewardShopDialog.collectAsState()
    if (showRewardShop) {
        RewardShopDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showRewardShopDialog.value = false }
        )
    }

    val showAddLearn by viewModel.showAddLearnDialog.collectAsState()
    if (showAddLearn) {
        AddLearnDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showAddLearnDialog.value = false }
        )
    }

    val showTeachBack by viewModel.showTeachBackDialog.collectAsState()
    val teachBackTarget by viewModel.teachBackTargetItem.collectAsState()
    if (showTeachBack && teachBackTarget != null) {
        com.example.selfcarehero.ui.dialogs.TeachBackDialog(
            item = teachBackTarget!!,
            viewModel = viewModel,
            onDismiss = {
                viewModel.showTeachBackDialog.value = false
                viewModel.teachBackTargetItem.value = null
            }
        )
    }

    val showAddTopic by viewModel.showAddTopicDialog.collectAsState()
    if (showAddTopic) {
        AddTopicDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showAddTopicDialog.value = false }
        )
    }

    val showAddAlert by viewModel.showAddAlertDialog.collectAsState()
    if (showAddAlert) {
        AddAlertDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showAddAlertDialog.value = false }
        )
    }

    // Weekly Review Dialog
    val showWeeklyReview by viewModel.showWeeklyReviewDialog.collectAsState()
    if (showWeeklyReview) {
        WeeklyReviewDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showWeeklyReviewDialog.value = false }
        )
    }

    // Confirm Restore Dialog with 'CONFIRM' safety guard
    val showConfirmRestore by viewModel.showConfirmRestoreDialog.collectAsState()
    val pendingSnapshot by viewModel.pendingRestoreSnapshot.collectAsState()
    if (showConfirmRestore && pendingSnapshot != null) {
        ConfirmRestoreDialog(
            snapshot = pendingSnapshot,
            onConfirm = { viewModel.executeConfirmedRestore() },
            onDismiss = {
                viewModel.showConfirmRestoreDialog.value = false
                viewModel.pendingRestoreSnapshot.value = null
            }
        )
    }

    // Reset Hero Guard Dialog
    val showResetHero by viewModel.showResetHeroDialog.collectAsState()
    if (showResetHero) {
        ResetHeroDialog(
            onConfirm = { viewModel.executeResetHero() },
            onDismiss = { viewModel.showResetHeroDialog.value = false }
        )
    }

    // Celebration Gold Shimmer Modal
    val showCelebration by viewModel.showCelebration.collectAsState()
    val celebrationTitle by viewModel.celebrationTitle.collectAsState()
    val celebrationSubtitle by viewModel.celebrationSubtitle.collectAsState()
    if (showCelebration) {
        CelebrationDialog(
            title = celebrationTitle,
            subtitle = celebrationSubtitle,
            onDismiss = { viewModel.showCelebration.value = false }
        )
    }

    // Comeback Bonus Welcome Dialog
    if (state.comebackBonus != null && state.comebackBonus?.pending == true) {
        ComebackBonusDialog(
            bonus = state.comebackBonus!!,
            onDismiss = { viewModel.dismissComebackBonus() }
        )
    }

    // Guided Routine Player Dialog
    val showRoutinePlayer by viewModel.showRoutinePlayerDialog.collectAsState()
    val activeRoutine by viewModel.activeRoutine.collectAsState()
    if (showRoutinePlayer && activeRoutine != null) {
        RoutinePlayerDialog(
            routine = activeRoutine!!,
            viewModel = viewModel,
            onDismiss = {
                viewModel.showRoutinePlayerDialog.value = false
                viewModel.activeRoutine.value = null
            }
        )
    }

    // Somatic Breath Pacer Dialog
    val showBreathPacer by viewModel.showBreathPacerDialog.collectAsState()
    if (showBreathPacer) {
        BreathPacerDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showBreathPacerDialog.value = false }
        )
    }

    // Offline Local AI Copilot Dialog
    val showLocalAi by viewModel.showLocalAiDialog.collectAsState()
    val initialAiPrompt by viewModel.initialAiPrompt.collectAsState()
    if (showLocalAi) {
        LocalAiDialog(
            viewModel = viewModel,
            initialPrompt = initialAiPrompt,
            onDismiss = {
                viewModel.showLocalAiDialog.value = false
                viewModel.initialAiPrompt.value = null
            }
        )
    }

    // Executive Monthly Recap Dialog
    val showMonthlyRecap by viewModel.showMonthlyRecapDialog.collectAsState()
    if (showMonthlyRecap) {
        MonthlyRecapDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showMonthlyRecapDialog.value = false }
        )
    }

    // Anti-Goal Edit Dialog
    val showEditAntiGoal by viewModel.showEditAntiGoalDialog.collectAsState()
    val editingAntiGoal by viewModel.editingAntiGoal.collectAsState()
    if (showEditAntiGoal) {
        com.example.selfcarehero.ui.dialogs.AntiGoalEditDialog(
            item = editingAntiGoal,
            viewModel = viewModel,
            onDismiss = {
                viewModel.showEditAntiGoalDialog.value = false
                viewModel.editingAntiGoal.value = null
            }
        )
    }

    // 90-Day Life Sprint Dialog
    val showSprintGoal by viewModel.showSprintGoalDialog.collectAsState()
    if (showSprintGoal) {
        com.example.selfcarehero.ui.dialogs.SprintGoalDialog(
            goal = state.activeSprint,
            viewModel = viewModel,
            onDismiss = { viewModel.showSprintGoalDialog.value = false }
        )
    }

    // Circadian Sleep Settings Dialog
    val showCircadianSettings by viewModel.showCircadianSettingsDialog.collectAsState()
    if (showCircadianSettings) {
        com.example.selfcarehero.ui.dialogs.CircadianSettingsDialog(
            config = state.circadianConfig,
            viewModel = viewModel,
            onDismiss = { viewModel.showCircadianSettingsDialog.value = false }
        )
    }

    // Carrot-Coin Habit Staking Dialog
    val showHabitContract by viewModel.showHabitContractDialog.collectAsState()
    if (showHabitContract) {
        com.example.selfcarehero.ui.dialogs.HabitContractDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showHabitContractDialog.value = false }
        )
    }

    // Streak Break Rescue Dialog
    val showRescueContract by viewModel.showRescueContractDialog.collectAsState()
    val rescueTarget by viewModel.rescueContractTarget.collectAsState()
    if (showRescueContract && rescueTarget != null) {
        com.example.selfcarehero.ui.dialogs.StreakBreakRescueDialog(
            contract = rescueTarget!!,
            viewModel = viewModel,
            onDismiss = {
                viewModel.showRescueContractDialog.value = false
                viewModel.rescueContractTarget.value = null
            }
        )
    }

    // Book & EQ Guide In-App Reader Modal
    val selectedBookForReading by viewModel.selectedBookForReading.collectAsState()
    if (selectedBookForReading != null) {
        BookReaderDialog(
            book = selectedBookForReading!!,
            viewModel = viewModel,
            onDismiss = { viewModel.closeBookReader() }
        )
    }

    // Add Custom Book / PDF Dialog
    val showAddBook by viewModel.showAddBookDialog.collectAsState()
    if (showAddBook) {
        AddBookDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showAddBookDialog.value = false }
        )
    }

    // AI Progression Export / Import Dialog
    val showAiExportImport by viewModel.showAiExportImportDialog.collectAsState()
    if (showAiExportImport) {
        ProgressionExportImportDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showAiExportImportDialog.value = false }
        )
    }

    // PIN Settings & Verification Dialogs (Phase 3, Feature 12)
    val showPinSettings by viewModel.showPinSettingsDialog.collectAsState()
    if (showPinSettings) {
        com.example.selfcarehero.ui.dialogs.PinSettingsDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showPinSettingsDialog.value = false }
        )
    }

    val showPinVerification by viewModel.showPinVerificationDialog.collectAsState()
    val pinTitle by viewModel.pinVerificationTitle.collectAsState()
    val pinSubtitle by viewModel.pinVerificationSubtitle.collectAsState()
    if (showPinVerification) {
        com.example.selfcarehero.ui.dialogs.PinVerificationDialog(
            viewModel = viewModel,
            title = pinTitle,
            subtitle = pinSubtitle,
            onDismiss = { viewModel.showPinVerificationDialog.value = false }
        )
    }

    // Future Learning Roadmap Dialogs
    val showAddRoadmapGoal by viewModel.showAddRoadmapGoalDialog.collectAsState()
    val editingRoadmapGoal by viewModel.editingRoadmapGoal.collectAsState()
    if (showAddRoadmapGoal) {
        RoadmapGoalDialog(
            goal = editingRoadmapGoal,
            viewModel = viewModel,
            onDismiss = {
                viewModel.showAddRoadmapGoalDialog.value = false
                viewModel.editingRoadmapGoal.value = null
            }
        )
    }

    val showAddRoadmapStep by viewModel.showAddRoadmapStepDialog.collectAsState()
    val editingRoadmapStep by viewModel.editingRoadmapStep.collectAsState()
    val roadmapStepGoalId by viewModel.roadmapStepGoalId.collectAsState()
    val roadmapStepParentId by viewModel.roadmapStepParentId.collectAsState()
    if (showAddRoadmapStep) {
        RoadmapStepDialog(
            step = editingRoadmapStep,
            goalId = roadmapStepGoalId,
            parentId = roadmapStepParentId,
            viewModel = viewModel,
            onDismiss = {
                viewModel.showAddRoadmapStepDialog.value = false
                viewModel.editingRoadmapStep.value = null
            }
        )
    }

    val showRoadmapTagDialog by viewModel.showRoadmapTagDialog.collectAsState()
    if (showRoadmapTagDialog) {
        RoadmapTagDialog(
            viewModel = viewModel,
            onDismiss = { viewModel.showRoadmapTagDialog.value = false }
        )
    }
    }
}
