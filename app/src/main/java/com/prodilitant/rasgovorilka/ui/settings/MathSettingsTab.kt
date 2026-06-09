package com.prodilitant.rasgovorilka.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.prodilitant.rasgovorilka.data.AppData

@Composable
fun MathSettingsTab(data: AppData, onSave: () -> Unit) {
    var maxNumber by remember { mutableStateOf(data.math.maxNumber.toString()) }
    var addChecked by remember { mutableStateOf(data.math.operations.contains("+")) }
    var subChecked by remember { mutableStateOf(data.math.operations.contains("-")) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        OutlinedTextField(
            value = maxNumber, onValueChange = { maxNumber = it },
            label = { Text("Максимальное число") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = addChecked, onCheckedChange = { addChecked = it })
            Text("Сложение")
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(checked = subChecked, onCheckedChange = { subChecked = it })
            Text("Вычитание")
        }
        Button(onClick = {
            data.math.maxNumber = maxNumber.toIntOrNull() ?: 10
            data.math.operations.clear()
            if (addChecked) data.math.operations.add("+")
            if (subChecked) data.math.operations.add("-")
            onSave()
        }) { Text("Сохранить") }
    }
}
