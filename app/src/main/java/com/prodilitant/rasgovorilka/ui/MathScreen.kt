package com.prodilitant.rasgovorilka.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.prodilitant.rasgovorilka.data.MathSettings
import kotlin.random.Random

@Composable
fun MathScreen(settings: MathSettings, tts: com.prodilitant.rasgovorilka.tts.TtsManager) {
    var problem by remember { mutableStateOf(generateProblem(settings)) }
    var userAnswer by remember { mutableStateOf("") }
    var feedback by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("${problem.first} = ?", style = MaterialTheme.typography.displayLarge)

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = userAnswer,
            onValueChange = { userAnswer = it },
            label = { Text("Ответ") },
            singleLine = true,
            enabled = feedback == null,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )

        Row(
            modifier = Modifier.padding(top = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(onClick = {
                val correct = problem.second
                if (userAnswer.toIntOrNull() == correct) {
                    feedback = "correct"
                    tts.speak("Правильно!")
                } else {
                    feedback = "wrong"
                    tts.speak("Попробуй ещё раз")
                }
            }) {
                Text("Проверить")
            }
            Button(onClick = {
                problem = generateProblem(settings)
                userAnswer = ""
                feedback = null
            }) {
                Text("Пропустить")
            }
        }

        if (feedback != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = if (feedback == "correct") "✅ Правильно!" else "❌ Неправильно. Правильный ответ: ${problem.second}",
                style = MaterialTheme.typography.bodyLarge
            )
            if (feedback != null) {
                Button(onClick = {
                    problem = generateProblem(settings)
                    userAnswer = ""
                    feedback = null
                }) {
                    Text("Далее")
                }
            }
        }
    }
}

private fun generateProblem(settings: MathSettings): Pair<String, Int> {
    val ops = settings.operations
    if (ops.isEmpty()) return "0 + 0" to 0
    val op = ops.random()
    val max = settings.maxNumber
    return when (op) {
        "+" -> {
            val a = Random.nextInt(0, max + 1)
            val b = Random.nextInt(0, max + 1)
            "$a + $b" to (a + b)
        }
        "-" -> {
            val a = Random.nextInt(0, max + 1)
            val b = Random.nextInt(0, a + 1)
            "$a - $b" to (a - b)
        }
        else -> "0 + 0" to 0
    }
}
