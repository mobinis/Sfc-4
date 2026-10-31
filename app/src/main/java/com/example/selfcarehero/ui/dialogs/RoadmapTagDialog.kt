package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.selfcarehero.ui.theme.SageGreenPrimary
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun RoadmapTagDialog(
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    var newTagName by remember { mutableStateOf("") }
    var selectedColor by remember { mutableStateOf("#3D7D62") }

    val presetColors = listOf(
        "#3D7D62" to "Sage Green",
        "#3B82F6" to "Sky Blue",
        "#E5A93C" to "Amber Gold",
        "#8B5CF6" to "Purple",
        "#EF4444" to "Rose Red",
        "#10B981" to "Emerald"
    )

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight(),
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🏷️ Manage Roadmap Tags",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    IconButton(onClick = onDismiss) {
                        Text("✕", fontSize = 16.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Existing tags
                Text("Existing Tags", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                Spacer(modifier = Modifier.height(6.dp))

                if (state.roadmapTags.isEmpty()) {
                    Text("No custom tags yet.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 160.dp)
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        state.roadmapTags.forEach { tag ->
                            val tagColor = try {
                                Color(android.graphics.Color.parseColor(tag.color))
                            } catch (_: Exception) {
                                SageGreenPrimary
                            }
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(tagColor.copy(alpha = 0.15f))
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(10.dp)
                                            .clip(CircleShape)
                                            .background(tagColor)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(tag.name, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                }
                                IconButton(
                                    onClick = { viewModel.deleteRoadmapTag(tag.id) },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Text("✕", fontSize = 12.sp, color = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider()
                Spacer(modifier = Modifier.height(12.dp))

                // Create new tag
                Text("Create New Tag", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface)
                Spacer(modifier = Modifier.height(6.dp))

                OutlinedTextField(
                    value = newTagName,
                    onValueChange = { newTagName = it },
                    label = { Text("Tag Name") },
                    placeholder = { Text("e.g. Neuroscience, Python, Deep Work") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Color presets
                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    presetColors.forEach { (cHex, _) ->
                        val color = try {
                            Color(android.graphics.Color.parseColor(cHex))
                        } catch (_: Exception) {
                            SageGreenPrimary
                        }
                        val isSelected = selectedColor == cHex
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(color)
                                .clickable { selectedColor = cHex }
                                .then(
                                    if (isSelected) Modifier.border(2.dp, MaterialTheme.colorScheme.onSurface, CircleShape)
                                    else Modifier
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isSelected) {
                                Text("✓", fontSize = 14.sp, color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Done")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            if (newTagName.isNotBlank()) {
                                viewModel.addRoadmapTag(newTagName.trim(), selectedColor)
                                newTagName = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = SageGreenPrimary)
                    ) {
                        Text("+ Add Tag", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
