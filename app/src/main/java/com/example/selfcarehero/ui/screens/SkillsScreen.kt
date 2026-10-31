package com.example.selfcarehero.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import com.example.selfcarehero.model.NodeItem
import com.example.selfcarehero.ui.theme.*
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun SkillsScreen(
    viewModel: SelfCareViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsState()
    val natureFilter by viewModel.skillNatureFilter.collectAsState()

    val natureOptions = remember {
        listOf(
            "all" to "All",
            "skill" to "🌳 Skills",
            "technique" to "⚡ Techniques",
            "concept" to "💡 Concepts",
            "habit" to "🔁 Habits",
            "course" to "🎓 Courses"
        )
    }

    // Set of expanded parent node IDs
    var expandedNodeIds by remember {
        mutableStateOf(
            state.nodes.filter { parent ->
                state.nodes.any { it.p == parent.id }
            }.map { it.id }.toSet()
        )
    }

    // Keep newly added parents expanded
    LaunchedEffect(state.nodes) {
        val allParentIds = state.nodes.filter { parent ->
            state.nodes.any { it.p == parent.id }
        }.map { it.id }.toSet()
        expandedNodeIds = expandedNodeIds + allParentIds
    }

    // Flatten tree with depth and apply nature filter and collapse/expand state
    val flatTree by remember(state.nodes, natureFilter, expandedNodeIds) {
        derivedStateOf {
            val tree = buildFlatTree(state.nodes, expandedNodeIds)
            if (natureFilter == "all") tree
            else tree.filter { it.depth == 0 || it.node.nature == natureFilter }
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { viewModel.openCreateNode("0") },
                containerColor = WarmAmberGold,
                contentColor = androidx.compose.ui.graphics.Color(0xFF121413),
                shape = CircleShape,
                elevation = FloatingActionButtonDefaults.elevation(defaultElevation = 6.dp),
                modifier = Modifier
                    .padding(bottom = 70.dp)
                    .size(56.dp)
                    .testTag("fab_add_skill")
            ) {
                Text(text = "+", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 120.dp)
        ) {
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Skill Tree & Knowledge",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            text = "${state.nodes.size} items across 6 pillars • Tap ▶ to expand branches",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // Nature Filter Chips (full horizontal scroll)
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState())
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    natureOptions.forEach { (nat, label) ->
                        val selected = natureFilter == nat
                        FilterChip(
                            selected = selected,
                            onClick = { viewModel.setSkillNatureFilter(nat) },
                            label = { Text(text = label, fontSize = 11.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primaryContainer,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimaryContainer,
                                containerColor = MaterialTheme.colorScheme.surfaceVariant,
                                labelColor = MaterialTheme.colorScheme.onSurfaceVariant
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = selected,
                                borderColor = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline
                            ),
                            modifier = Modifier.testTag("filter_chip_$nat")
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
            }

            items(flatTree, key = { it.node.id }) { item ->
                SkillTreeRow(
                    item = item,
                    viewModel = viewModel,
                    onToggleFold = { id ->
                        expandedNodeIds = if (id in expandedNodeIds) {
                            expandedNodeIds - id
                        } else {
                            expandedNodeIds + id
                        }
                    },
                    modifier = Modifier.padding(vertical = 3.dp)
                )
            }
        }
    }
}

@Immutable
data class FlatNodeItem(
    val node: NodeItem,
    val depth: Int,
    val hasChildren: Boolean,
    val isExpanded: Boolean
)

private fun buildFlatTree(allNodes: List<NodeItem>, expandedIds: Set<String>): List<FlatNodeItem> {
    val result = mutableListOf<FlatNodeItem>()
    val roots = allNodes.filter { it.p == "0" }

    fun traverse(node: NodeItem, depth: Int) {
        val children = allNodes.filter { it.p == node.id }
        val hasChildren = children.isNotEmpty()
        val isExpanded = node.id in expandedIds
        result.add(FlatNodeItem(node, depth, hasChildren, isExpanded))
        if (hasChildren && isExpanded) {
            children.forEach { child ->
                traverse(child, depth + 1)
            }
        }
    }

    roots.forEach { root ->
        traverse(root, 0)
    }
    return result
}

@Composable
fun SkillTreeRow(
    item: FlatNodeItem,
    viewModel: SelfCareViewModel,
    onToggleFold: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val node = item.node
    val indent = (item.depth * 16).dp

    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(start = indent)
            .clip(RoundedCornerShape(14.dp))
            .background(
                if (item.depth == 0) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f)
                else MaterialTheme.colorScheme.surface
            )
            .border(
                1.dp,
                if (item.depth == 0) MaterialTheme.colorScheme.primary.copy(alpha = 0.35f) else MaterialTheme.colorScheme.outline,
                RoundedCornerShape(14.dp)
            )
            .clickable { viewModel.openEditNode(node) }
            .padding(horizontal = 10.dp, vertical = 8.dp)
            .testTag("skill_tree_item_${node.id}"),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            // Fold / Expand Chevron Toggle with 44x44dp touch area
            if (item.hasChildren) {
                IconButton(
                    onClick = { onToggleFold(node.id) },
                    modifier = Modifier
                        .size(36.dp)
                        .minimumInteractiveComponentSize()
                        .testTag("toggle_fold_${node.id}")
                ) {
                    Text(
                        text = if (item.isExpanded) "▼" else "▶",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            } else if (item.depth > 0) {
                Text(
                    text = "└─",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.outline,
                    modifier = Modifier.padding(start = 6.dp, end = 6.dp)
                )
            } else {
                Spacer(modifier = Modifier.width(6.dp))
            }

            Text(
                text = node.e,
                fontSize = if (item.depth == 0) 22.sp else 18.sp
            )
            Spacer(modifier = Modifier.width(8.dp))

            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = node.n,
                        fontWeight = if (item.depth == 0) FontWeight.Bold else FontWeight.SemiBold,
                        fontSize = if (item.depth == 0) 15.sp else 13.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    // Nature Badge
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = MaterialTheme.colorScheme.secondaryContainer,
                        border = CardDefaults.outlinedCardBorder().copy(
                            brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.outline)
                        )
                    ) {
                        Text(
                            text = "[${node.nature.uppercase()}]",
                            fontSize = 9.sp,
                            color = MaterialTheme.colorScheme.onSecondaryContainer,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                        )
                    }

                    // Importance Star Badge
                    when (node.importance) {
                        "critical" -> {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.error.copy(alpha = 0.12f)
                            ) {
                                Text(
                                    text = "⭐⭐⭐ Critical",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                        "high" -> {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = "⭐⭐ High",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.secondary,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                        "medium" -> {
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant
                            ) {
                                Text(
                                    text = "⭐ Med",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    if (node.rememorize?.enabled == true) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = MaterialTheme.colorScheme.primaryContainer
                        ) {
                            Text(
                                text = "🧠 ${node.rememorize.intervalDays}d",
                                fontSize = 9.sp,
                                color = MaterialTheme.colorScheme.onPrimaryContainer,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                            )
                        }
                    }
                }

                if (node.k == "count") {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Goal: ${node.g} ${node.u}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = TabularNumberStyle
                    )
                }
            }
        }

        // Action Buttons Row (Add Sub-skill + Edit)
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            IconButton(
                onClick = { viewModel.openCreateNode(parentId = node.id) },
                modifier = Modifier
                    .minimumInteractiveComponentSize()
                    .size(38.dp)
                    .testTag("add_sub_skill_${node.id}")
            ) {
                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.primaryContainer,
                    modifier = Modifier.size(28.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = "+",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }

            IconButton(
                onClick = { viewModel.openEditNode(node) },
                modifier = Modifier
                    .minimumInteractiveComponentSize()
                    .size(38.dp)
                    .testTag("edit_skill_btn_${node.id}")
            ) {
                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.size(28.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(text = "✏️", fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

