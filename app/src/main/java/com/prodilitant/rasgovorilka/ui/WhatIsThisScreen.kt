package com.prodilitant.rasgovorilka.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import com.prodilitant.rasgovorilka.data.AppData
import com.prodilitant.rasgovorilka.data.Card
import kotlinx.coroutines.delay

@Composable
fun WhatIsThisScreen(data: AppData, tts: com.prodilitant.rasgovorilka.tts.TtsManager) {
    // Собираем все карточки из выбранных категорий (или всех, если whatIsThisCategoryIds пуст)
    val categories = if (data.whatIsThisCategoryIds.isEmpty()) data.categories
    else data.categories.filter { data.whatIsThisCategoryIds.contains(it.id) }
    val allCards = categories.flatMap { data.cards[it.id] ?: emptyList() }

    var currentIndex by remember { mutableIntStateOf(0) }
    var userAnswer by remember { mutableStateOf("") }
    var feedback by remember { mutableStateOf<String?>(null) }
    var showNext by remember { mutableStateOf(false) }

    if (allCards.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Нет карточек для викторины. Добавьте карточки в выбранные категории.")
        }
        return
    }

    val card = allCards[currentIndex % allCards.size]

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Отображение карточки
        Text(text = card.emoji ?: "❓", style = MaterialTheme.typography.displayLarge)
        if (data.whatIsThisShowLabels) {
            Text(card.text, style = MaterialTheme.typography.headlineSmall)
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = userAnswer,
            onValueChange = { userAnswer = it },
            label = { Text("Что это?") },
            singleLine = true,
            enabled = feedback == null,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = {
                if (feedback == null) checkAnswer(card, userAnswer) { feedback = it; showNext = true }
            }),
            modifier = Modifier.fillMaxWidth()
        )

        Row(
            modifier = Modifier.padding(top = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(onClick = {
                if (feedback == null) checkAnswer(card, userAnswer) { feedback = it; showNext = true }
            }) {
                Text("Ответить")
            }
            Button(onClick = {
                nextCard(allCards) { newIndex ->
                    currentIndex = newIndex
                    userAnswer = ""
                    feedback = null
                    showNext = false
                }
            }) {
                Text("Пропустить")
            }
        }

        if (feedback != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = if (feedback == "correct") "✅ Правильно!" else "❌ Неправильно. Правильный ответ: ${card.text}",
                style = MaterialTheme.typography.bodyLarge
            )
        }

        if (showNext) {
            Button(onClick = {
                nextCard(allCards) { newIndex ->
                    currentIndex = newIndex
                    userAnswer = ""
                    feedback = null
                    showNext = false
                }
            }) {
                Text("Далее")
            }
        }
    }
}

private fun checkAnswer(card: Card, answer: String, onResult: (String) -> Unit) {
    val correct = card.text.trim().lowercase() == answer.trim().lowercase()
    onResult(if (correct) "correct" else "wrong")
}

private fun nextCard(allCards: List<Card>, onNextIndex: (Int) -> Unit) {
    if (allCards.size <= 1) {
        onNextIndex(0) // просто сбросим
    } else {
        onNextIndex((0 until allCards.size).random())
    }
}
