package com.prodilitant.rasgovorilka.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.prodilitant.rasgovorilka.data.AppData
import com.prodilitant.rasgovorilka.data.Card
import java.util.UUID

@Composable
fun QuickButtonsTab(data: AppData, onSave: () -> Unit) {
    var showDialog by remember { mutableStateOf(false) }
    var editingItem by remember { mutableStateOf<Card?>(null) }

    LazyColumn(modifier = Modifier.fillMaxSize()) {
        itemsIndexed(data.quickButtons, key = { _, btn -> btn.id }) { index, btn ->
            Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)) {
                Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("${btn.emoji ?: "🔘"} ${btn.text}", modifier = Modifier.weight(1f))
                    IconButton(onClick = {
                        if (index > 0) {
                            val moved = data.quickButtons.removeAt(index)
                            data.quickButtons.add(index - 1, moved)
                            onSave()
                        }
                    }) {
                        Icon(Icons.Filled.KeyboardArrowUp, "Вверх")
                    }
                    IconButton(onClick = {
                        if (index < data.quickButtons.size - 1) {
                            val moved = data.quickButtons.removeAt(index)
                            data.quickButtons.add(index + 1, moved)
                            onSave()
                        }
                    }) {
                        Icon(Icons.Filled.KeyboardArrowDown, "Вниз")
                    }
                    IconButton(onClick = { editingItem = btn; showDialog = true }) {
                        Icon(Icons.Filled.Edit, "Редактировать")
                    }
                    IconButton(onClick = { data.quickButtons.removeAt(index); onSave() }) {
                        Icon(Icons.Filled.Delete, "Удалить")
                    }
                }
            }
        }
        item {
            Button(onClick = {
                editingItem = Card(id = UUID.randomUUID().toString(), text = "", emoji = null)
                showDialog = true
            }, modifier = Modifier.padding(8.dp)) {
                Text("+ Добавить")
            }
        }
    }

    if (showDialog && editingItem != null) {
        var text by remember { mutableStateOf(editingItem!!.text) }
        var emoji by remember { mutableStateOf(editingItem!!.emoji ?: "") }
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text(if (editingItem!!.text.isEmpty()) "Новая кнопка" else "Редактировать") },
            text = {
                Column {
                    OutlinedTextField(value = text, onValueChange = { text = it }, label = { Text("Текст") })
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(value = emoji, onValueChange = { emoji = it }, label = { Text("Эмодзи (можно пусто)") })
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (text.isNotBlank()) {
                        val item = editingItem!!
                        item.text = text; item.emoji = emoji.ifEmpty { null }
                        if (data.quickButtons.none { it.id == item.id }) {
                            data.quickButtons.add(item)
                        }
                        onSave()
                        showDialog = false
                    }
                }) { Text("OK") }
            },
            dismissButton = { TextButton(onClick = { showDialog = false }) { Text("Отмена") } }
        )
    }
}
