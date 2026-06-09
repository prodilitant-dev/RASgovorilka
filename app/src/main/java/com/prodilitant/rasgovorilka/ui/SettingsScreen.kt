package com.prodilitant.rasgovorilka.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.prodilitant.rasgovorilka.data.DataManager
import com.prodilitant.rasgovorilka.ui.settings.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(dataManager: DataManager, onBack: () -> Unit) {
    var appData by remember { mutableStateOf<com.prodilitant.rasgovorilka.data.AppData?>(null) }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        appData = dataManager.loadData()
    }

    if (appData == null) return

    val data = appData!!
    val tabs = listOf("Категории", "Карточки", "Быстрые", "Да/Нет", "Викторина", "Математика", "Общие", "Об авторе")
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Настройки") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Назад")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            ScrollableTabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }
            when (selectedTab) {
                0 -> CategoriesTab(data, onSave = { coroutineScope.launch { dataManager.saveData(data) } })
                1 -> CardsTab(data, onSave = { coroutineScope.launch { dataManager.saveData(data) } })
                2 -> QuickButtonsTab(data, onSave = { coroutineScope.launch { dataManager.saveData(data) } })
                3 -> YesNoTab(data, onSave = { coroutineScope.launch { dataManager.saveData(data) } })
                4 -> WhatIsThisSettingsTab(data, onSave = { coroutineScope.launch { dataManager.saveData(data) } })
                5 -> MathSettingsTab(data, onSave = { coroutineScope.launch { dataManager.saveData(data) } })
                6 -> GeneralSettingsTab(data, dataManager, onSave = { coroutineScope.launch { dataManager.saveData(data) } })
                7 -> AboutTab()
            }
        }
    }
}
