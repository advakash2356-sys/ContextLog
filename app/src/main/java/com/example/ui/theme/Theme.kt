package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme =
  darkColorScheme(
    primary = Indigo80,
    onPrimary = OnIndigoContainerLight,
    primaryContainer = IndigoContainerDark,
    onPrimaryContainer = OnIndigoContainerDark,
    secondary = Teal80,
    onSecondary = OnTealContainerLight,
    secondaryContainer = TealContainerDark,
    onSecondaryContainer = OnTealContainerDark,
    tertiary = Amber80,
    onTertiary = OnAmberContainerLight,
    tertiaryContainer = AmberContainerDark,
    onTertiaryContainer = OnAmberContainerDark,
    background = SlateBackgroundDark,
    onBackground = Color(0xFFE2E2E9),
    surface = SlateSurfaceDark,
    onSurface = Color(0xFFE2E2E9),
    surfaceVariant = SlateSurfaceVariantDark,
    onSurfaceVariant = Color(0xFFC4C6D0),
    outline = SlateOutlineDark
  )

private val LightColorScheme =
  lightColorScheme(
    primary = Indigo40,
    onPrimary = Color.White,
    primaryContainer = IndigoContainerLight,
    onPrimaryContainer = OnIndigoContainerLight,
    secondary = Teal40,
    onSecondary = Color.White,
    secondaryContainer = TealContainerLight,
    onSecondaryContainer = OnTealContainerLight,
    tertiary = Amber40,
    onTertiary = Color.White,
    tertiaryContainer = AmberContainerLight,
    onTertiaryContainer = OnAmberContainerLight,
    background = SlateBackgroundLight,
    onBackground = Color(0xFF191C20),
    surface = SlateSurfaceLight,
    onSurface = Color(0xFF191C20),
    surfaceVariant = SlateSurfaceVariantLight,
    onSurfaceVariant = Color(0xFF44474F),
    outline = SlateOutlineLight
  )

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = true,
  content: @Composable () -> Unit,
) {
  val colorScheme =
    when {
      dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
        val context = LocalContext.current
        if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
      }
      darkTheme -> DarkColorScheme
      else -> LightColorScheme
    }

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
