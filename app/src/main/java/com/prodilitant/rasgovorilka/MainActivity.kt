package com.prodilitant.rasgovorilka

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.prodilitant.rasgovorilka.ui.MainScreen
import com.prodilitant.rasgovorilka.data.DataManager
import com.prodilitant.rasgovorilka.tts.TtsManager
import com.prodilitant.rasgovorilka.ui.RASgovorilkaTheme
import kotlinx.coroutines.runBlocking

class MainActivity : ComponentActivity() {
    private lateinit var ttsManager: TtsManager
    private lateinit var dataManager: DataManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ttsManager = TtsManager(this)
        dataManager = DataManager(this)

        setContent {
            var highContrast by remember { mutableStateOf(false) }

            // Читаем текущий highContrast из данных
            LaunchedEffect(Unit) {
                val data = dataManager.loadData()
                highContrast = data.highContrast
            }

            RASgovorilkaTheme(highContrast = highContrast) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen(dataManager = dataManager, ttsManager = ttsManager)
                }
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            window.decorView.systemUiVisibility = (
                android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            )
        }
    }
}
