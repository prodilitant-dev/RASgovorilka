package com.prodilitant.rasgovorilka.ui.settings

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.prodilitant.rasgovorilka.data.AppData
import com.prodilitant.rasgovorilka.data.DataManager
import kotlinx.coroutines.launch

@Composable
fun GeneralSettingsTab(data: AppData, dataManager: DataManager, onSave: () -> Unit) {
    var highContrast by remember { mutableStateOf(data.highContrast) }
    var maxSentence by remember { mutableStateOf(data.maxSentenceLength.toString()) }
    var greetingText by remember { mutableStateOf(data.greetingText) }
    var greetingEnabled by remember { mutableStateOf(data.greetingEnabled) }
    var timerMinutes by remember { mutableStateOf(data.timerMinutes.toString()) }
    var timerPhrase by remember { mutableStateOf(data.timerPhrase) }
    var fullscreenEnabled by remember { mutableStateOf(data.fullscreenEnabled) }
    var gridColumns by remember { mutableStateOf(data.gridColumns.toString()) }

    var say by remember { mutableStateOf(data.visibleModes["say"] ?: true) }
    var yesno by remember { mutableStateOf(data.visibleModes["yesno"] ?: true) }
    var text by remember { mutableStateOf(data.visibleModes["text"] ?: true) }
    var timer by remember { mutableStateOf(data.visibleModes["timer"] ?: true) }
    var whatisthis by remember { mutableStateOf(data.visibleModes["whatisthis"] ?: false) }
    var math by remember { mutableStateOf(data.visibleModes["math"] ?: false) }

    val coroutineScope = rememberCoroutineScope()

    val exportLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/json")) { uri ->
        uri?.let { coroutineScope.launch { dataManager.exportToUri(it) } }
    }
    val importLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        uri?.let {
            coroutineScope.launch {
                val imported = dataManager.importFromUri(it)
                data.categories.clear(); data.categories.addAll(imported.categories)
                data.cards.clear(); data.cards.putAll(imported.cards)
                data.quickButtons.clear(); data.quickButtons.addAll(imported.quickButtons)
                data.yesnoAnswers.clear(); data.yesnoAnswers.addAll(imported.yesnoAnswers)
                data.highContrast = imported.highContrast
                data.maxSentenceLength = imported.maxSentenceLength
                data.greetingText = imported.greetingText
                data.greetingEnabled = imported.greetingEnabled
                data.timerMinutes = imported.timerMinutes
                data.timerPhrase = imported.timerPhrase
                data.fullscreenEnabled = imported.fullscreenEnabled
                data.gridColumns = imported.gridColumns
                data.visibleModes.clear(); data.visibleModes.putAll(imported.visibleModes)
                data.whatIsThisCategoryIds.clear(); data.whatIsThisCategoryIds.addAll(imported.whatIsThisCategoryIds)
                data.whatIsThisShowLabels = imported.whatIsThisShowLabels
                data.math = imported.math
                onSave()
            }
        }
    }

    Column(
        modifier = Modifier
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text("Основные", style = MaterialTheme.typography.titleSmall)
        Spacer(modifier = Modifier.height(8.dp))
        SwitchRow("Высокий контраст", highContrast) { highContrast = it }
        OutlinedTextField(value = maxSentence, onValueChange = { maxSentence = it }, label = { Text("Макс. слов") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = greetingText, onValueChange = { greetingText = it }, label = { Text("Приветствие") }, modifier = Modifier.fillMaxWidth())
        SwitchRow("Произносить при старте", greetingEnabled) { greetingEnabled = it }
        OutlinedTextField(value = timerMinutes, onValueChange = { timerMinutes = it }, label = { Text("Таймер (мин)") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = timerPhrase, onValueChange = { timerPhrase = it }, label = { Text("Фраза таймера") }, modifier = Modifier.fillMaxWidth())
        SwitchRow("Полноэкранный режим", fullscreenEnabled) { fullscreenEnabled = it }
        OutlinedTextField(value = gridColumns, onValueChange = { gridColumns = it }, label = { Text("Колонок в сетке") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())

        Spacer(modifier = Modifier.height(16.dp))
        Text("Режимы", style = MaterialTheme.typography.titleSmall)
        SwitchRow("🗣 Сказать", say) { say = it }
        SwitchRow("🙂 Быстрые", yesno) { yesno = it }
        SwitchRow("📝 Текст", text) { text = it }
        SwitchRow("⏱ Таймер", timer) { timer = it }
        SwitchRow("❓ Что это", whatisthis) { whatisthis = it }
        SwitchRow("🔢 Математика", math) { math = it }

        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
            Button(onClick = { exportLauncher.launch("rasgovorilka_backup.json") }) { Text("📤 Экспорт") }
            Button(onClick = { importLauncher.launch(arrayOf("application/json")) }) { Text("📥 Импорт") }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = {
            data.highContrast = highContrast
            data.maxSentenceLength = maxSentence.toIntOrNull() ?: 15
            data.greetingText = greetingText
            data.greetingEnabled = greetingEnabled
            data.timerMinutes = timerMinutes.toIntOrNull() ?: 1
            data.timerPhrase = timerPhrase
            data.fullscreenEnabled = fullscreenEnabled
            data.gridColumns = gridColumns.toIntOrNull() ?: 4
            data.visibleModes["say"] = say
            data.visibleModes["yesno"] = yesno
            data.visibleModes["text"] = text
            data.visibleModes["timer"] = timer
            data.visibleModes["whatisthis"] = whatisthis
            data.visibleModes["math"] = math
            onSave()
        }, modifier = Modifier.fillMaxWidth()) { Text("Сохранить настройки") }
    }
}
