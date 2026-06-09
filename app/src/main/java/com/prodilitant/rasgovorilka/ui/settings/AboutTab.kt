package com.prodilitant.rasgovorilka.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AboutTab() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "РАСговорилка",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Версия: сырая )))",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Привет! Я — Виталий.\n\n" +
                    "Это приложение создано мной с помощью ИИ.\n" +
                    "Я не программист, но очень упрямый.\n\n" +
                    "Я знаю, каково это, когда ребенок с РАС.\n" +
                    "Приложение будет распространяться всегда бесплатно.\n" +
                    "+ в карму за обратную связь.\n\n" +
                    "Ваш ПроДилИтант\n" +
                    "prodilitant@gmail.com",
            style = MaterialTheme.typography.bodyLarge,
            lineHeight = 24.sp
        )
    }
}
