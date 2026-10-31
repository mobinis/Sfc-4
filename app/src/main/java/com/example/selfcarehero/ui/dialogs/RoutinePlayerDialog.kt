package com.example.selfcarehero.ui.dialogs

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.selfcarehero.model.RoutineFlow
import com.example.selfcarehero.ui.components.RoutineFlowPlayer
import com.example.selfcarehero.ui.viewmodel.SelfCareViewModel

@Composable
fun RoutinePlayerDialog(
    routine: RoutineFlow,
    viewModel: SelfCareViewModel,
    onDismiss: () -> Unit
) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        RoutineFlowPlayer(
            initialRoutine = routine,
            viewModel = viewModel,
            onClose = onDismiss,
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .padding(vertical = 16.dp)
        )
    }
}
