package com.example.selfcarehero.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// =========================================================================
// SAGE SANCTUARY THEME ARCHITECTURE
// Light Canvas: #F7F6F2, Card: #FFFFFF, Accent: #2D6A4F, Warm Amber: #E5A93C
// Dark Canvas:  #121413, Card: #1B211E, Accent: #3D7D62, Warm Amber: #E5A93C
// =========================================================================

private val SageSanctuaryLightColorScheme = lightColorScheme(
    primary = SageLightAc,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = SageLightAcs,
    onPrimaryContainer = SageLightInk,
    secondary = SageLightWarn,
    onSecondary = SageLightInk,
    secondaryContainer = SageLightWarnSurface,
    onSecondaryContainer = SageLightInkSecondary,
    tertiary = SageLightAc,
    onTertiary = androidx.compose.ui.graphics.Color.White,
    background = SageLightBg,
    onBackground = SageLightInk,
    surface = SageLightSf,
    onSurface = SageLightInk,
    surfaceVariant = SageLightAcs,
    onSurfaceVariant = SageLightInkSecondary,
    outline = SageLightLine,
    outlineVariant = SageLightLineStrong,
    error = SageLightDanger,
    onError = androidx.compose.ui.graphics.Color.White
)

private val SageSanctuaryDarkColorScheme = darkColorScheme(
    primary = SageDarkAc,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    primaryContainer = SageDarkAcs,
    onPrimaryContainer = SageDarkInk,
    secondary = SageDarkWarn,
    onSecondary = SageDarkBg,
    secondaryContainer = SageDarkWarnSurface,
    onSecondaryContainer = SageDarkWarn,
    tertiary = SageDarkAc,
    onTertiary = androidx.compose.ui.graphics.Color.White,
    background = SageDarkBg,
    onBackground = SageDarkInk,
    surface = SageDarkSf,
    onSurface = SageDarkInk,
    surfaceVariant = SageDarkSfElevated,
    onSurfaceVariant = SageDarkInkSecondary,
    outline = SageDarkLine,
    outlineVariant = SageDarkLineStrong,
    error = SageDarkDanger,
    onError = androidx.compose.ui.graphics.Color.White
)

@Composable
fun SelfCareHeroTheme(
    isDarkMode: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (isDarkMode) SageSanctuaryDarkColorScheme else SageSanctuaryLightColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = colorScheme.background.toArgb()
                window.navigationBarColor = colorScheme.surface.toArgb()
                WindowCompat.getInsetsController(window, view).apply {
                    isAppearanceLightStatusBars = !isDarkMode
                    isAppearanceLightNavigationBars = !isDarkMode
                }
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
