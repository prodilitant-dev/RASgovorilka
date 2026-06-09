package com.prodilitant.rasgovorilka.ui

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.prodilitant.rasgovorilka.data.AppData
import com.prodilitant.rasgovorilka.data.Card
import com.prodilitant.rasgovorilka.data.DataManager
import com.prodilitant.rasgovorilka.tts.TtsManager
import kotlinx.coroutines.delay

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(dataManager: DataManager, ttsManager: TtsManager) {
    var appData by remember { mutableStateOf<AppData?>(null) }
    var currentMode by remember { mutableStateOf("say") }
    var selectedCategoryId by remember { mutableStateOf<String?>(null) }
    var showSettings by remember { mutableStateOf(false) }
    var sentence by remember { mutableStateOf<List<Card>>(emptyList()) }

    LaunchedEffect(Unit) {
        appData = dataManager.loadData()
        selectedCategoryId = appData?.categories?.firstOrNull()?.id
    }

    if (appData == null) return

    val data = appData!!

    if (showSettings) {
        SettingsScreen(dataManager = dataManager, onBack = { showSettings = false })
        return
    }

    Column(modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        // === Верхняя панель: режимы + настройки ===
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 8.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            data.visibleModes.forEach { (mode, visible) ->
                if (visible) {
                    FilterChip(
                        selected = currentMode == mode,
                        onClick = { currentMode = mode },
                        label = {
                            Text(
                                when (mode) {
                                    "say" -> "🗣 Сказать"
                                    "yesno" -> "🙂 Быстрые"
                                    "text" -> "📝 Текст"
                                    "timer" -> "⏱ Таймер"
                                    "whatisthis" -> "❓ Что это"
                                    "math" -> "🔢 Математика"
                                    else -> mode
                                }
                            )
                        }
                    )
                }
            }
            Spacer(modifier = Modifier.weight(1f))
            IconButton(onClick = { showSettings = true }) {
                Icon(Icons.Filled.Settings, contentDescription = "Настройки", tint = MaterialTheme.colorScheme.onBackground)
            }
        }

        // === Категории (только для "say") ===
        if (currentMode == "say") {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                data.categories.forEach { cat ->
                    FilterChip(
                        selected = cat.id == selectedCategoryId,
                        onClick = { selectedCategoryId = cat.id },
                        label = { Text(cat.name) }
                    )
                }
            }
        }

        // === Строка предложения (всегда видна в "say") ===
        if (currentMode == "say") {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                shape = RoundedCornerShape(24.dp),
                color = MaterialTheme.colorScheme.primaryContainer,
                tonalElevation = 2.dp
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    if (sentence.isEmpty()) {
                        Text(
                            "Составьте предложение",
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.5f),
                            modifier = Modifier.padding(8.dp)
                        )
                    } else {
                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            sentence.forEachIndexed { index, word ->
                                AssistChip(
                                    onClick = {
                                        sentence = sentence.toMutableList().also { it.removeAt(index) }
                                    },
                                    label = { Text("${word.emoji ?: ""} ${word.text}") },
                                    trailingIcon = {
                                        Icon(Icons.Filled.Close, contentDescription = "Удалить", modifier = Modifier.size(16.dp))
                                    }
                                )
                            }
                        }
                    }
                    // Кнопки действия
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        FilledIconButton(
                            onClick = { sentence.forEach { ttsManager.speak(it.text) } },
                            enabled = sentence.isNotEmpty(),
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(Icons.Filled.PlayArrow, contentDescription = "Озвучить", modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        IconButton(
                            onClick = { sentence = emptyList() },
                            enabled = sentence.isNotEmpty(),
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(Icons.Filled.Delete, contentDescription = "Очистить", modifier = Modifier.size(20.dp))
                        }
                    }
                }
            }
        }

        // === Основной контент ===
        Box(modifier = Modifier.weight(1f)) {
            when (currentMode) {
                "say" -> SayMode(
                    data = data,
                    selectedCategoryId = selectedCategoryId,
                    gridColumns = data.gridColumns,
                    onCardClick = { card ->
                        if (sentence.size < data.maxSentenceLength) {
                            sentence = sentence + card
                        }
                    }
                )
                "yesno" -> YesNoMode(
                    answers = data.yesnoAnswers,
                    gridColumns = data.gridColumns,
                    onAnswerClick = { ttsManager.speak(it.text) }
                )
                "text" -> TextMode(ttsManager = ttsManager)
                "timer" -> TimerMode(
                    initialMinutes = data.timerMinutes,
                    onFinished = { ttsManager.speak(data.timerPhrase) }
                )
                "whatisthis" -> WhatIsThisScreen(data = data, tts = ttsManager)
                "math" -> MathScreen(settings = data.math, tts = ttsManager)
            }
        }

        // === Быстрые кнопки (только для "say") ===
        if (currentMode == "say") {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                tonalElevation = 2.dp,
                color = MaterialTheme.colorScheme.surface
            ) {
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(data.quickButtons) { btn ->
                        AssistChip(
                            onClick = {
                                if (sentence.size < data.maxSentenceLength) {
                                    sentence = sentence + btn
                                }
                            },
                            label = { Text("${btn.emoji ?: ""} ${btn.text}") }
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SayMode(
    data: AppData,
    selectedCategoryId: String?,
    gridColumns: Int,
    onCardClick: (Card) -> Unit
) {
    val cards = selectedCategoryId?.let { data.cards[it] } ?: emptyList()
    LazyVerticalGrid(
        columns = GridCells.Fixed(gridColumns),
        modifier = Modifier.fillMaxSize().padding(4.dp)
    ) {
        items(cards.size) { index ->
            val card = cards[index]
            Card(
                onClick = { onCardClick(card) },
                modifier = Modifier.padding(4.dp),
                shape = RoundedCornerShape(8.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(
                    modifier = Modifier.padding(8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (card.imageBase64 != null) {
                        val bytes = Base64.decode(card.imageBase64, Base64.DEFAULT)
                        val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                        bitmap?.let {
                            Image(
                                bitmap = it.asImageBitmap(),
                                contentDescription = card.text,
                                modifier = Modifier
                                    .aspectRatio(1f)
                                    .fillMaxWidth()
                            )
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .aspectRatio(1f)
                                .fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(card.emoji ?: "📄", fontSize = 32.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        card.text,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 2,
                        softWrap = true
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun YesNoMode(answers: List<Card>, gridColumns: Int, onAnswerClick: (Card) -> Unit) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(gridColumns),
        modifier = Modifier.fillMaxSize().padding(4.dp)
    ) {
        items(answers.size) { index ->
            val ans = answers[index]
            Card(
                onClick = { onAnswerClick(ans) },
                modifier = Modifier.padding(4.dp),
                shape = RoundedCornerShape(8.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(
                    modifier = Modifier.padding(8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (ans.imageBase64 != null) {
                        val bytes = Base64.decode(ans.imageBase64, Base64.DEFAULT)
                        val bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
                        bitmap?.let {
                            Image(
                                bitmap = it.asImageBitmap(),
                                contentDescription = ans.text,
                                modifier = Modifier
                                    .aspectRatio(1f)
                                    .fillMaxWidth()
                            )
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .aspectRatio(1f)
                                .fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(ans.emoji ?: "❓", fontSize = 32.sp)
                        }
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        ans.text,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
    }
}

@Composable
fun TextMode(ttsManager: TtsManager) {
    var text by remember { mutableStateOf("") }
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Button(
            onClick = { ttsManager.speak(text) },
            modifier = Modifier.align(Alignment.End)
        ) {
            Icon(Icons.Filled.PlayArrow, contentDescription = null)
            Spacer(modifier = Modifier.width(4.dp))
            Text("Озвучить")
        }
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("Введите текст") },
            modifier = Modifier.fillMaxWidth().weight(1f)
        )
    }
}

@Composable
fun TimerMode(initialMinutes: Int, onFinished: () -> Unit) {
    var timeLeft by remember { mutableIntStateOf(initialMinutes * 60) }
    var isRunning by remember { mutableStateOf(false) }

    LaunchedEffect(isRunning) {
        while (isRunning && timeLeft > 0) {
            delay(1000L)
            timeLeft--
        }
        if (isRunning && timeLeft == 0) {
            isRunning = false
            onFinished()
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "%02d:%02d".format(timeLeft / 60, timeLeft % 60),
            style = MaterialTheme.typography.displayLarge
        )
        Row {
            Button(onClick = { if (!isRunning) isRunning = true }) { Text("▶ Старт") }
            Spacer(modifier = Modifier.width(8.dp))
            Button(onClick = { isRunning = false; timeLeft = initialMinutes * 60 }) { Text("↺ Сброс") }
        }
    }
}
