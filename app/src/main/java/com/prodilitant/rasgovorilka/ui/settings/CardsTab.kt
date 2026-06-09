package com.prodilitant.rasgovorilka.ui.settings

import android.content.Context
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.prodilitant.rasgovorilka.data.AppData
import com.prodilitant.rasgovorilka.data.Card
import java.util.Base64
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CardsTab(data: AppData, onSave: () -> Unit) {
    var selectedCatId by remember { mutableStateOf(data.categories.firstOrNull()?.id ?: "") }
    val context = LocalContext.current

    // Локальный наблюдаемый список для выбранной категории
    val cards = remember(data.cards, selectedCatId) {
        mutableStateListOf<Card>().also { it.addAll(data.cards[selectedCatId] ?: emptyList()) }
    }

    // Немедленная синхронизация с data
    LaunchedEffect(cards.toList()) {
        data.cards[selectedCatId]?.clear()
        data.cards[selectedCatId]?.addAll(cards)
    }

    var showDialog by remember { mutableStateOf(false) }
    var editingCard by remember { mutableStateOf<Card?>(null) }

    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let {
            val base64 = uriToBase64(context, it)
            if (base64 != null && editingCard != null) {
                editingCard!!.imageBase64 = base64
                onSave()
            }
        }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        LazyRow(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(data.categories) { cat ->
                FilterChip(
                    selected = cat.id == selectedCatId,
                    onClick = { selectedCatId = cat.id },
                    label = { Text(cat.name) }
                )
            }
        }
        LazyColumn(modifier = Modifier.weight(1f)) {
            itemsIndexed(cards, key = { _, card -> card.id }) { index, card ->
                Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("${card.emoji ?: "📄"} ${card.text}", modifier = Modifier.weight(1f))
                        IconButton(onClick = {
                            if (index > 0) {
                                cards.add(index - 1, cards.removeAt(index))
                                onSave()
                            }
                        }) {
                            Icon(Icons.Filled.KeyboardArrowUp, contentDescription = "Вверх")
                        }
                        IconButton(onClick = {
                            if (index < cards.size - 1) {
                                cards.add(index + 1, cards.removeAt(index))
                                onSave()
                            }
                        }) {
                            Icon(Icons.Filled.KeyboardArrowDown, contentDescription = "Вниз")
                        }
                        IconButton(onClick = { editingCard = card; showDialog = true }) {
                            Icon(Icons.Filled.Edit, contentDescription = "Редактировать")
                        }
                        IconButton(onClick = { editingCard = card; imagePicker.launch("image/*") }) {
                            Icon(Icons.Filled.Image, contentDescription = "Изображение")
                        }
                        if (card.imageBase64 != null) {
                            IconButton(onClick = {
                                card.imageBase64 = null
                                onSave()
                            }) {
                                Icon(Icons.Filled.DeleteForever, contentDescription = "Удалить изображение")
                            }
                        }
                        IconButton(onClick = {
                            cards.removeAt(index)
                            onSave()
                        }) {
                            Icon(Icons.Filled.Delete, contentDescription = "Удалить")
                        }
                    }
                }
            }
            item {
                Button(onClick = {
                    editingCard = Card(id = UUID.randomUUID().toString(), text = "", emoji = null)
                    showDialog = true
                }, modifier = Modifier.padding(8.dp)) {
                    Text("+ Добавить карточку")
                }
            }
        }
    }

    if (showDialog && editingCard != null) {
        var text by remember { mutableStateOf(editingCard!!.text) }
        var emoji by remember { mutableStateOf(editingCard!!.emoji ?: "") }
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = { Text(if (editingCard!!.text.isEmpty()) "Новая карточка" else "Редактировать") },
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
                        val card = editingCard!!
                        card.text = text
                        card.emoji = emoji.ifEmpty { null }
                        if (cards.none { it.id == card.id }) {
                            cards.add(card)
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

fun uriToBase64(context: Context, uri: Uri): String? {
    return try {
        val inputStream = context.contentResolver.openInputStream(uri)
        val bytes = inputStream?.readBytes()
        inputStream?.close()
        bytes?.let { Base64.getEncoder().encodeToString(it) }
    } catch (e: Exception) { null }
}
