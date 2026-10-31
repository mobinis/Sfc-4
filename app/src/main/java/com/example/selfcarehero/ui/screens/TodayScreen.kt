package com.example.selfcarehero.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.selfcarehero.model.NodeItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel
import java.util.Calendar

@Composable
fun TodayScreen(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val routineFilter by viewModel.routineFilter.collectAsState()

    // Routine & Category Segmented Switcher state (Specification 4.A.4)
    var groupMode by remember { mutableStateOf("routines") } // "routines" vs "categories"
    var categoryFilter by remember { mutableStateOf("all") }

    // Collapsible secondary widget states
    var isSprintExpanded by remember { mutableStateOf(false) }
    var isAntiGoalsExpanded by remember { mutableStateOf(false) }
    var isRoutinesExpanded by remember { mutableStateOf(false) }

    // Daily Three Status memoized with derivedStateOf to prevent whole-tree scans on unrelated state updates
    val learnDone by remember(state.nodes, state.ev) {
        derivedStateOf { state.nodes.any { it.p == "learn" && viewModel.isSkillDone(it) } }
    }
    val buildDone by remember(state.nodes, state.ev) {
        derivedStateOf { state.nodes.any { it.p == "build" && viewModel.isSkillDone(it) } }
    }
    val bodyDone by remember(state.nodes, state.ev) {
        derivedStateOf { state.nodes.any { it.p == "body" && viewModel.isSkillDone(it) } }
    }
    val dailyThreeComplete by remember {
        derivedStateOf { learnDone && buildDone && bodyDone }
    }
    val completedCount by remember(learnDone, buildDone, bodyDone) {
        derivedStateOf { (if (learnDone) 1 else 0) + (if (buildDone) 1 else 0) + (if (bodyDone) 1 else 0) }
    }

    // Memoized habits filtering using derivedStateOf to avoid allocating filtered lists on every frame
    val habits by remember(state.nodes, state.lowEnergyMode, state.lowEnergyEssentialIds, routineFilter, groupMode, categoryFilter) {
        derivedStateOf {
            state.nodes.filter { node ->
                val base = node.p != "0" && (!state.lowEnergyMode || state.lowEnergyEssentialIds.contains(node.id))
                if (!base) false
                else if (groupMode == "routines") {
                    routineFilter == "all" || node.routineTime == routineFilter || (node.routineTime == null && routineFilter == "anytime")
                } else {
                    categoryFilter == "all" || node.p == categoryFilter
                }
            }
        }
    }

    // Active Habit Momentum Banner (Habit Stacking) memoized with derivedStateOf
    val activeMomentumNode by remember(state.nodes, state.activeMomentumHabitId) {
        derivedStateOf { state.nodes.firstOrNull { it.id == state.activeMomentumHabitId } }
    }

    // Time-based warm greeting
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    val greeting = when {
        hour < 12 -> "Good morning, Hero 🌅"
        hour < 17 -> "Good afternoon, Hero ☀️"
        else -> "Good evening, Hero 🌙"
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        contentPadding = PaddingValues(top = 10.dp, bottom = 90.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Warm Hero Greeting
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = greeting,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "Focus on small, mindful repetitions today.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Low Energy Switch Pill
                Surface(
                    onClick = { viewModel.toggleLowEnergyMode() },
                    shape = RoundedCornerShape(12.dp),
                    color = if (state.lowEnergyMode) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (state.lowEnergyMode) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                        )
                    ),
                    modifier = Modifier.minimumInteractiveComponentSize()
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🌿", fontSize = 12.sp)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (state.lowEnergyMode) "Low-Energy ON" else "Essentials",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // Quick Action Hub (Thumb-Friendly, High-Efficiency)
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    QuickActionPill(
                        emoji = "🌊",
                        label = "Urge Surf",
                        accentColor = MaterialTheme.colorScheme.primary,
                        onClick = { viewModel.openUrgeSurfingScreen() }
                    )
                }
                item {
                    QuickActionPill(
                        emoji = "⏱️",
                        label = "Deep Focus",
                        accentColor = MaterialTheme.colorScheme.secondary,
                        onClick = { viewModel.showFocusTimerDialog.value = true }
                    )
                }
                item {
                    QuickActionPill(
                        emoji = "🤖",
                        label = "AI Copilot",
                        accentColor = MaterialTheme.colorScheme.primary,
                        onClick = { viewModel.openLocalAi() }
                    )
                }
                item {
                    QuickActionPill(
                        emoji = "🫁",
                        label = "Breath Pacer",
                        accentColor = MaterialTheme.colorScheme.primary,
                        onClick = { viewModel.openBreathPacer() }
                    )
                }
                item {
                    QuickActionPill(
                        emoji = "⚡",
                        label = "Quick Log",
                        accentColor = MaterialTheme.colorScheme.secondary,
                        onClick = { viewModel.openEditNode(null) }
                    )
                }
                item {
                    QuickActionPill(
                        emoji = "🎬",
                        label = "Video Library",
                        accentColor = MaterialTheme.colorScheme.primary,
                        onClick = { viewModel.selectTab(com.example.selfcarehero.ui.viewmodel.TabType.VIDEOS) }
                    )
                }
                item {
                    QuickActionPill(
                        emoji = "✍️",
                        label = "Reflection",
                        accentColor = MaterialTheme.colorScheme.secondary,
                        onClick = { viewModel.selectTab(com.example.selfcarehero.ui.viewmodel.TabType.JOURNAL) }
                    )
                }
            }
        }

        // Daily Three & Circadian Momentum Hub with Visual Progress Ring
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (dailyThreeComplete) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.45f) else MaterialTheme.colorScheme.surface
                ),
                border = CardDefaults.outlinedCardBorder().copy(
                    brush = androidx.compose.ui.graphics.SolidColor(
                        if (dailyThreeComplete) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                    )
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("daily_three_banner")
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            // Circular 3-Segment Visual Ring
                            Box(
                                modifier = Modifier.size(46.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                val outlineColor = MaterialTheme.colorScheme.surfaceVariant
                                val learnCol = PillarLearnAccent
                                val buildCol = PillarBuildAccent
                                val bodyCol = PillarBodyAccent

                                Canvas(modifier = Modifier.fillMaxSize()) {
                                    val strokeWidth = 5.dp.toPx()
                                    // Background track
                                    drawCircle(
                                        color = outlineColor,
                                        style = Stroke(width = strokeWidth)
                                    )
                                    // Segment 1: Learn (top-left, 100 deg arc)
                                    drawArc(
                                        color = if (learnDone) learnCol else Color.Transparent,
                                        startAngle = 130f,
                                        sweepAngle = 100f,
                                        useCenter = false,
                                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                    )
                                    // Segment 2: Build (top-right, 100 deg arc)
                                    drawArc(
                                        color = if (buildDone) buildCol else Color.Transparent,
                                        startAngle = 250f,
                                        sweepAngle = 100f,
                                        useCenter = false,
                                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                    )
                                    // Segment 3: Body (bottom, 100 deg arc)
                                    drawArc(
                                        color = if (bodyDone) bodyCol else Color.Transparent,
                                        startAngle = 10f,
                                        sweepAngle = 100f,
                                        useCenter = false,
                                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                    )
                                }

                                Text(
                                    text = if (dailyThreeComplete) "⭐" else "$completedCount/3",
                                    fontSize = if (dailyThreeComplete) 18.sp else 12.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (dailyThreeComplete) MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.onSurface,
                                    style = TabularNumberStyle
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = "Daily Three Pillars",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = if (dailyThreeComplete) "🎉 All 3 Pillars Secured! +30 XP" else "1 action from each pillar advances streak",
                                    fontSize = 11.sp,
                                    color = if (dailyThreeComplete) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        if (dailyThreeComplete) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = MaterialTheme.colorScheme.secondary,
                                modifier = Modifier.padding(start = 4.dp)
                            ) {
                                Text(
                                    text = "⭐ 100% WON",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = MaterialTheme.colorScheme.onSecondary,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        PillarPill("🧠 Learn", learnDone, PillarLearnAccent, Modifier.weight(1f))
                        PillarPill("🛠️ Build", buildDone, PillarBuildAccent, Modifier.weight(1f))
                        PillarPill("💪 Body", bodyDone, PillarBodyAccent, Modifier.weight(1f))
                    }

                    // Integrated Circadian Sleep Clock Pill
                    Spacer(modifier = Modifier.height(10.dp))
                    com.example.selfcarehero.ui.components.CircadianClockPill(viewModel = viewModel)
                }
            }
        }

        // Weekly Quests Hub (Pillar Milestones & Carrot-Coin Rewards)
        item {
            com.example.selfcarehero.ui.components.WeeklyQuestBanner(viewModel = viewModel)
        }

        // Segmented Switcher: ☀️ Routines & Anchors vs 📁 By Categories
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(3.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (groupMode == "routines") MaterialTheme.colorScheme.surface else Color.Transparent)
                            .clickable { groupMode = "routines" }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "☀️ Routines & Anchors",
                            fontSize = 11.sp,
                            fontWeight = if (groupMode == "routines") FontWeight.Bold else FontWeight.Medium,
                            color = if (groupMode == "routines") MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (groupMode == "categories") MaterialTheme.colorScheme.surface else Color.Transparent)
                            .clickable { groupMode = "categories" }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "📁 By Categories",
                            fontSize = 11.sp,
                            fontWeight = if (groupMode == "categories") FontWeight.Bold else FontWeight.Medium,
                            color = if (groupMode == "categories") MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Secondary Filter Pills Row
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    if (groupMode == "routines") {
                        val routineOptions = listOf(
                            Triple("all", "All Habits (${habits.size})", "✨"),
                            Triple("morning", "Morning", "🌅"),
                            Triple("afternoon", "Afternoon", "☀️"),
                            Triple("evening", "Evening", "🌙"),
                            Triple("anytime", "Flexible", "🔄")
                        )

                        items(routineOptions) { (key, label, emoji) ->
                            val isSelected = routineFilter == key
                            Surface(
                                onClick = { viewModel.setRoutineFilter(key) },
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                border = CardDefaults.outlinedCardBorder().copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(
                                        if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                                    )
                                ),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(emoji, fontSize = 12.sp)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = label,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    } else {
                        val categoryOptions = listOf(
                            Triple("all", "All (${habits.size})", "✨"),
                            Triple("learn", "🧠 Learn", "📚"),
                            Triple("build", "🛠️ Build", "⚙️"),
                            Triple("body", "💪 Body", "🏃")
                        )

                        items(categoryOptions) { (key, label, _) ->
                            val isSelected = categoryFilter == key
                            Surface(
                                onClick = { categoryFilter = key },
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                                border = CardDefaults.outlinedCardBorder().copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(
                                        if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                                    )
                                ),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Active Habit Momentum Banner (Habit Stacking)
        val momentumNode = activeMomentumNode
        if (momentumNode != null) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp)
                        .testTag("habit_momentum_card"),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PastelApricotAmber.copy(alpha = 0.35f)),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = Brush.linearGradient(listOf(PastelApricotAmber, PastelBlossomPink))
                    )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("⚡", fontSize = 22.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    text = "Stack Momentum Active!",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Complete '${momentumNode.n}' next for +10 XP bonus",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }

        // Habit Cards List
        if (habits.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = CardDefaults.outlinedCardBorder().copy(
                        brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 12.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("🌱", fontSize = 36.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = if (state.lowEnergyMode) "Low-Energy Mode active: only 3 essentials shown." else "No habits in this routine slot.",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Add a new mindful habit to begin building daily momentum.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(14.dp))
                        Button(
                            onClick = { viewModel.openEditNode(null) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.primary,
                                contentColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .minimumInteractiveComponentSize()
                                .height(44.dp)
                        ) {
                            Text("+ Add First Habit", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }
                }
            }
        } else {
            items(habits, key = { it.id }) { node ->
                HabitCardItem(
                    node = node,
                    viewModel = viewModel,
                    isDone = viewModel.isSkillDone(node)
                )
            }
        }

        // Collapsible Section 1: Guided Rituals Runner
        if (state.routines.isNotEmpty()) {
            item {
                CollapsibleHeader(
                    title = "Guided Rituals Player",
                    badge = "${state.routines.size} Rituals",
                    emoji = "☀️",
                    isExpanded = isRoutinesExpanded,
                    onToggle = { isRoutinesExpanded = !isRoutinesExpanded }
                )
            }

            item {
                AnimatedVisibility(
                    visible = isRoutinesExpanded,
                    enter = expandVertically() + fadeIn(),
                    exit = shrinkVertically() + fadeOut()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        state.routines.forEach { routine ->
                            Card(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { viewModel.launchRoutine(routine) }
                                    .testTag("btn_routine_${routine.id}"),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                border = CardDefaults.outlinedCardBorder().copy(
                                    brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
                                )
                            ) {
                                Column(modifier = Modifier.padding(10.dp)) {
                                    Text(routine.icon, fontSize = 20.sp)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = routine.name,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        maxLines = 1
                                    )
                                    Text(
                                        text = "${routine.steps.size} steps",
                                        fontSize = 10.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Collapsible Section 2: 90-Day Life Sprint & Compass
        item {
            CollapsibleHeader(
                title = "90-Day Life Sprint & Identity",
                badge = if (state.activeSprint != null) "${state.activeSprint?.title}" else "Quarterly Focus",
                emoji = "🎯",
                isExpanded = isSprintExpanded,
                onToggle = { isSprintExpanded = !isSprintExpanded }
            )
        }

        item {
            AnimatedVisibility(
                visible = isSprintExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                com.example.selfcarehero.ui.components.LifeSprintCard(viewModel = viewModel)
            }
        }

        // Collapsible Section 3: Dopamine Anti-Goals (Avoid List)
        item {
            CollapsibleHeader(
                title = "Dopamine Shield (Anti-Goals)",
                badge = "${state.antiGoals.size} Avoid Rules",
                emoji = "🛡️",
                isExpanded = isAntiGoalsExpanded,
                onToggle = { isAntiGoalsExpanded = !isAntiGoalsExpanded }
            )
        }

        item {
            AnimatedVisibility(
                visible = isAntiGoalsExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                com.example.selfcarehero.ui.components.AntiGoalsSection(viewModel = viewModel)
            }
        }
    }
}

@Composable
private fun QuickActionPill(
    emoji: String,
    label: String,
    accentColor: Color,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
        ),
        modifier = Modifier
            .minimumInteractiveComponentSize()
            .height(44.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(emoji, fontSize = 15.sp)
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = label,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

@Composable
private fun PillarPill(
    name: String,
    done: Boolean,
    accentColor: Color = MaterialTheme.colorScheme.primary,
    modifier: Modifier = Modifier
) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = if (done) accentColor.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant,
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(
                if (done) accentColor else MaterialTheme.colorScheme.outline
            )
        ),
        modifier = modifier
            .minimumInteractiveComponentSize()
            .height(38.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = name,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (done) "✓" else "○",
                fontSize = 12.sp,
                color = if (done) accentColor else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun CollapsibleHeader(
    title: String,
    badge: String,
    emoji: String,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    Surface(
        onClick = onToggle,
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surface,
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
        ),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
            .minimumInteractiveComponentSize()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(emoji, fontSize = 16.sp)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.width(6.dp))
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Text(
                        text = badge,
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Icon(
                imageVector = if (isExpanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                contentDescription = if (isExpanded) "Collapse" else "Expand",
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(22.dp)
            )
        }
    }
}

@Composable
private fun HabitCardItem(
    node: NodeItem,
    viewModel: SelfCareViewModel,
    isDone: Boolean
) {
    val pillarAccent = when (node.p) {
        "learn" -> PillarLearnAccent
        "build" -> PillarBuildAccent
        "body" -> PillarBodyAccent
        else -> MaterialTheme.colorScheme.primary
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isDone) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f) else MaterialTheme.colorScheme.surface
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(
                if (isDone) MaterialTheme.colorScheme.primary.copy(alpha = 0.6f) else MaterialTheme.colorScheme.outline
            )
        ),
        modifier = Modifier
            .fillMaxWidth()
            .testTag("habit_card_${node.id}")
    ) {
        IntrinsicHeightCardContent(
            node = node,
            viewModel = viewModel,
            isDone = isDone,
            pillarAccent = pillarAccent
        )
    }
}

@Composable
private fun IntrinsicHeightCardContent(
    node: NodeItem,
    viewModel: SelfCareViewModel,
    isDone: Boolean,
    pillarAccent: Color
) {
    // Spring Scale Micro-Interaction (Specification Section 5)
    val checkScale by animateFloatAsState(
        targetValue = if (isDone) 1.06f else 1.0f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "tick_spring"
    )

    val countToday = viewModel.getSkillCount(node.id)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(IntrinsicSize.Min),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Left-Aligned Pillar Accent Strip (Linear Precision Hierarchy)
        Box(
            modifier = Modifier
                .width(5.dp)
                .fillMaxHeight()
                .background(pillarAccent)
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Interactive Emoji / Check (Explicit 48dp Fitts's law target)
                Surface(
                    onClick = { viewModel.toggleCheckHabit(node) },
                    shape = CircleShape,
                    color = if (isDone) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier
                        .scale(checkScale)
                        .minimumInteractiveComponentSize()
                        .size(48.dp)
                        .testTag("habit_check_${node.id}")
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = if (isDone) "✓" else node.e,
                            fontSize = if (isDone) 20.sp else 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isDone) Color.White else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = node.n,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        if (countToday > 0) {
                            Text(
                                text = "🔥 $countToday",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.secondary,
                                style = TabularNumberStyle
                            )
                        }

                        if (node.importance == "critical" || node.importance == "high") {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = node.importance.uppercase(),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.secondary,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    if (!node.ifThenAnchor.isNullOrBlank()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
                            ) {
                                Text(
                                    text = "⚓ After ${node.ifThenAnchor}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                )
                            }
                        }
                    } else if (node.note.isNotBlank()) {
                        Text(
                            text = node.note,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Stepper / Action Controls (Minimum 48×48dp Touch Targets)
            if (node.k == "count") {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    IconButton(
                        onClick = { viewModel.incrementCountHabit(node, -1) },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .size(48.dp)
                            .testTag("btn_dec_${node.id}")
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = "−",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }

                    Text(
                        text = "${node.sliderLevel}/${node.g}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        style = TabularNumberStyle,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    )

                    IconButton(
                        onClick = { viewModel.incrementCountHabit(node, 1) },
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .size(48.dp)
                            .testTag("btn_inc_${node.id}")
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = "+",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            } else {
                Surface(
                    onClick = { viewModel.toggleCheckHabit(node) },
                    shape = CircleShape,
                    color = if (isDone) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier
                        .scale(checkScale)
                        .minimumInteractiveComponentSize()
                        .size(48.dp)
                        .testTag("habit_tick_${node.id}")
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = if (isDone) "✓" else "+",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isDone) Color.White else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}

