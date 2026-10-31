package com.example.selfcarehero.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// =========================================================================
// MASTER SPECIFICATION: SAGE SANCTUARY COLOR TOKEN SYSTEM (WCAG AAA)
// Harmonizing Linear/Notion precision with Headspace/Calm warmth
// =========================================================================

// --- SAGE SANCTUARY LIGHT TOKENS ---
val SageLightBg           = Color(0xFFF7F6F2) // App Canvas (Soft warm parchment)
val SageLightSf           = Color(0xFFFFFFFF) // Card Surface (Pure porcelain)
val SageLightSfElevated   = Color(0xFFFFFFFF) // Elevated Surface
val SageLightLine         = Color(0xFFE5E3DA) // Structural Borders
val SageLightLineStrong   = Color(0xFFC8C5B8) // Strong Borders
val SageLightInk          = Color(0xFF1C221E) // Primary Typography (Contrast > 13:1)
val SageLightInkSecondary = Color(0xFF353E38) // Secondary Typography
val SageLightMu           = Color(0xFF5C655E) // Muted / Timestamp Text
val SageLightAc           = Color(0xFF2D6A4F) // Brand Sage Accent (Deep restorative sage)
val SageLightAcHover      = Color(0xFF22533E) // Sage Hover / Pressed
val SageLightAcs          = Color(0xFFE8F3ED) // Active Container / Soft Sage Pill
val SageLightPip          = Color(0xFFF5C6AA) // Warm peach accent
val SageLightBl           = Color(0xFFEA867A) // Soft coral accent
val SageLightWarn         = Color(0xFFE5A93C) // Warm Amber / Milestone Gold
val SageLightWarnSurface  = Color(0xFFFEF3C7) // Amber Container / Pill
val SageLightDanger       = Color(0xFFB91C1C) // Destructive Red
val SageLightDangerSurface= Color(0xFFFEE2E2) // Danger Container

// --- SAGE SANCTUARY DARK TOKENS ---
val SageDarkBg            = Color(0xFF121413) // App Canvas (Deep Warm Charcoal)
val SageDarkSf            = Color(0xFF1B211E) // Card Surface (Elevated Pine Surface)
val SageDarkSfElevated    = Color(0xFF242D29) // Elevated Surface
val SageDarkLine          = Color(0xFF384A41) // Structural Borders
val SageDarkLineStrong    = Color(0xFF4D6356) // Strong Borders
val SageDarkInk           = Color(0xFFF4F7F4) // Primary Typography (Linen White)
val SageDarkInkSecondary  = Color(0xFFB2C4BC) // Secondary Typography
val SageDarkMu            = Color(0xFF859A90) // Muted / Timestamp Text
val SageDarkAc            = Color(0xFF3D7D62) // Forest Sage Primary Accent
val SageDarkAcHover       = Color(0xFF4D9677) // Sage Hover / Pressed
val SageDarkAcs           = Color(0xFF2A5643) // Active Container / Pill
val SageDarkPip           = Color(0xFFF0BE9E) // Warm peach accent
val SageDarkBl            = Color(0xFFE27A6E) // Soft coral accent
val SageDarkWarn          = Color(0xFFE5A93C) // Warm Amber Accent
val SageDarkWarnSurface   = Color(0xFF2E2308) // Amber Surface
val SageDarkDanger        = Color(0xFFD95D39) // Destructive Coral Red
val SageDarkDangerSurface = Color(0xFF331414) // Danger Surface

// --- ERGONOMIC BUTTON STYLING SHAPES ---
val SageButtonShape       = androidx.compose.foundation.shape.RoundedCornerShape(12.dp)

// =========================================================================
// Pillar Specific Color Accents (Linear Precision)
// =========================================================================
val PillarLearnAccent = Color(0xFF2D6A4F) // Mind / Knowledge Sage
val PillarBuildAccent = Color(0xFFB45309) // Craft / Build Amber
val PillarBodyAccent  = Color(0xFF2563EB) // Vitality / Body Cobalt
val PillarSoulAccent  = Color(0xFF7C3AED) // Mindfulness / Reflection Iris

// =========================================================================
// Backward-Compatible Semantic Aliases (Preserves all existing component calls)
// =========================================================================
val PastelBlossomPink = SageLightAc
val PastelSoftBlush    = SageLightAcs
val PastelWarmCream    = SageLightBg
val PastelApricotAmber = SageLightWarn

val LightCreamCanvas    = SageLightBg
val LightCardSurface    = SageLightSf
val LightCardVariant    = SageLightAcs
val LightBorderSoft     = SageLightLine
val LightTextEspresso   = SageLightInk
val LightTextMuted      = SageLightMu
val LightTextSubtle     = SageLightMu

val DarkEspressoBase    = SageDarkBg
val DarkEspressoSurface = SageDarkSf
val DarkEspressoVariant = SageDarkSfElevated
val DarkEspressoBorder  = SageDarkLine
val DarkTextLinen       = SageDarkInk
val DarkTextSecondary   = SageDarkInkSecondary
val DarkTextMuted       = SageDarkMu

val SageGreenPrimary = SageLightAc
val MintSageGreen   = SageDarkAc
val ForestSage400   = SageDarkAc
val ForestSage500   = SageLightAc
val ForestSage600   = Color(0xFF23543E)
val ForestSage700   = SageDarkAcs
val ForestSage800   = Color(0xFF16271F)
val ForestSage900   = SageDarkBg
val WarmTerracotta  = SageLightDanger

val WarmCharcoal950 = DarkEspressoBase
val WarmCharcoal900 = DarkEspressoSurface
val WarmSurface800  = DarkEspressoSurface
val WarmSurface700  = DarkEspressoVariant
val WarmBorder      = DarkEspressoBorder

val WarmAmberGold   = SageLightWarn
val WarmAmberLight  = SageDarkWarn
val WarmAmberDark   = Color(0xFF92400E)
val WarmSuccess     = MintSageGreen

val Emerald900 = ForestSage900
val Emerald800 = ForestSage800
val Emerald700 = ForestSage700
val Emerald600 = ForestSage600
val Emerald500 = ForestSage500
val Emerald400 = ForestSage400

val AmberGold  = WarmAmberGold
val AmberLight = WarmAmberLight
val AmberDark  = WarmAmberDark

val TealAccent = SageDarkAc
val SoftBackground = DarkEspressoBase
val SurfaceCard = DarkEspressoSurface
val SurfaceCardVariant = DarkEspressoVariant
val LineBorder = DarkEspressoBorder

val TextPrimary = DarkTextLinen
val TextSecondary = DarkTextSecondary
val TextMuted = DarkTextMuted

val DangerRed = SageDarkDanger
val SuccessGreen = SageDarkAc


