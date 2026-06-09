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
import com.prodilitant.rasgovorilka.data.Category
import java.util.UUID

@Composable
fun CategoriesTab(data: AppData, onSave: () -> Unit) {
    var showDialog by remember { mutableStateOf(false) }
    var editingCategory by remember { mutableStateOf<Category?>(null) }

    // Локальный наблюдаемый список, немедленно синхронизируемый с data
    val categories = remember { 
        mutableStateListOf<Category>().also { it.addAll(data.categories) }
    }

    // Синхронизация при изменении локального списка
    LaunchedEffect(categories.toList()) {
        data.categories.clear()
        data.categories.addAll(categories)
    }

    LazyColumn(modifier = Modifier.fillMaxSize()) {
        itemsIndexed(categories, key = { _, cat -> cat.id }) { index, cat ->
            Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(cat.name, modifier = Modifier.weight(1f))
                    IconButton(onClick = {
                        if (index > 0) {
                            categories.add(index - 1, categories.removeAt(index))
                            onSave()
                        }
                    }) {
                        Icon(Icons.Filled.KeyboardArrowUp, contentDescription = "Вверх")
                    }
                    IconButton(onClick = {
                        if (index < categories.size - 1) {
                            categories.add(index + 1, categories.removeAt(index))
                            onSave()
                        }
                    }) {
                        Icon(Icons.Filled.KeyboardArrowDown, contentDescription = "Вниз")
                    }
                    IconButton(onClick = { editingCategory = cat; showDialog = true }) {
                        Icon(Icons.Filled.Edit, contentDescription = "Переименовать")
                    }
                    IconButton(onClick = {
                        categories.removeAt(index)
                        data.cards.remove(cat.id)
                        onSave()
                    }) {
                        Icon(Icons.Filled.Delete, contentDescription = "Удалить")
                    }
                }
            }
        }
        item {
            Button(onClick = {
                editingCategory = Category(id = UUID.randomUUID().toString(), name = "")
                showDialog = true
            }, modifier = Modifier.padding(8.dp)) {
                Text("+ Добавить категорию")
            }
        }
    }

    if (showDialog && editingCategory != null) {
        var name by remember { mutableStateOf(editingCategory!!.name) }
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text(if (editingCategory!!.name.isEmpty()) "Новая категория" else "Переименовать") },
            text = { OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Название") }) },
            confirmButton = {
                TextButton(onClick = {
                    if (name.isNotBlank()) {
                        val cat = editingCategory!!
                        cat.name = name
                        if (categories.none { it.id == cat.id }) {
                            categories.add(cat)
                            data.cards[cat.id] = mutableListOf()
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
