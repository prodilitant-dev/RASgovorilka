package com.prodilitant.rasgovorilka.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF4CAF50),
    onPrimary = Color.Black,
    primaryContainer = Color(0xFFE8F5E9),
    onPrimaryContainer = Color(0xFF1B5E20),
    background = Color(0xFFF0F2F5),
    onBackground = Color(0xFF1A1A1A),
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF1A1A1A),
    outline = Color(0xFFD0D7DE),
    secondary = Color(0xFF4CAF50),
    onSecondary = Color.Black,
    surfaceVariant = Color(0xFFE9ECEF),
    onSurfaceVariant = Color(0xFF6C757D)
)

@Composable
fun RASgovorilkaTheme(highContrast: Boolean = false, content: @Composable () -> Unit) {
    val colorScheme = if (highContrast) {
        lightColorScheme(
            primary = Color(0xFFFFCC00),
            onPrimary = Color.Black,
            primaryContainer = Color(0xFF333333),
            onPrimaryContainer = Color(0xFFFFCC00),
            background = Color.Black,
            onBackground = Color(0xFFFFFF00),
            surface = Color(0xFF1A1A1A),
            onSurface = Color(0xFFFFFF00),
            outline = Color(0xFFFFFF00),
            secondary = Color(0xFFFFCC00),
            onSecondary = Color.Black,
            surfaceVariant = Color(0xFF333333),
            onSurfaceVariant = Color(0xFFFFFF00)
        )
    } else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
