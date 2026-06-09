package com.prodilitant.rasgovorilka.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.prodilitant.rasgovorilka.data.AppData

@Composable
fun WhatIsThisSettingsTab(data: AppData, onSave: () -> Unit) {
    var showLabels by remember { mutableStateOf(data.whatIsThisShowLabels) }
    LazyColumn(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        item {
            Text("Категории для викторины", style = MaterialTheme.typography.titleSmall)
            data.categories.forEach { cat ->
                val checked = data.whatIsThisCategoryIds.isEmpty() || data.whatIsThisCategoryIds.contains(cat.id)
                var isChecked by remember { mutableStateOf(checked) }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth().clickable {
                        isChecked = !isChecked
                        if (isChecked) {
                            if (data.whatIsThisCategoryIds.isEmpty()) data.whatIsThisCategoryIds.addAll(data.categories.map { it.id })
                            if (!data.whatIsThisCategoryIds.contains(cat.id)) data.whatIsThisCategoryIds.add(cat.id)
                        } else data.whatIsThisCategoryIds.remove(cat.id)
                        onSave()
                    }
                ) {
                    Checkbox(checked = isChecked, onCheckedChange = null)
                    Text(cat.name)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            SwitchRow("Показывать подписи", showLabels) {
                showLabels = it
                data.whatIsThisShowLabels = it
                onSave()
            }
        }
    }
}

@Composable
fun SwitchRow(text: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(text, modifier = Modifier.weight(1f))
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
