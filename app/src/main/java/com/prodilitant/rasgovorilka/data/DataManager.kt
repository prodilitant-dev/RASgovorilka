package com.prodilitant.rasgovorilka.data

import android.content.Context
import android.net.Uri
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

data class Card(
    var id: String,
    var text: String,
    var emoji: String?,
    var imageBase64: String? = null,
    var audioBase64: String? = null
)

data class Category(
    var id: String,
    var name: String
)

data class AppData(
    var categories: MutableList<Category> = mutableListOf(),
    var cards: MutableMap<String, MutableList<Card>> = mutableMapOf(),
    var quickButtons: MutableList<Card> = mutableListOf(),
    var yesnoAnswers: MutableList<Card> = mutableListOf(),
    var visibleModes: MutableMap<String, Boolean> = mutableMapOf(
        "say" to true,
        "yesno" to true,
        "text" to true,
        "timer" to true,
        "whatisthis" to false,
        "math" to false
    ),
    var highContrast: Boolean = false,
    var maxSentenceLength: Int = 15,
    var greetingText: String = "Привет",
    var greetingEnabled: Boolean = true,
    var timerMinutes: Int = 1,
    var timerPhrase: String = "Время вышло",
    var fullscreenEnabled: Boolean = false,
    var whatIsThisCategoryIds: MutableList<String> = mutableListOf(),
    var whatIsThisShowLabels: Boolean = false,
    var math: MathSettings = MathSettings(),
    var gridColumns: Int = 4   // <-- добавлено
)

data class MathSettings(
    var maxNumber: Int = 10,
    var operations: MutableList<String> = mutableListOf("+", "-")
)

class DataManager(private val context: Context) {
    private val gson = Gson()
    private val dataFile: File
        get() = File(context.filesDir, "data.json")

    private var _data: AppData? = null

    suspend fun loadData(): AppData {
        return withContext(Dispatchers.IO) {
            if (_data != null) return@withContext _data!!
            if (dataFile.exists()) {
                val json = dataFile.readText()
                _data = gson.fromJson(json, AppData::class.java)
                _data ?: createDefaultData()
            } else {
                val default = createDefaultData()
                saveData(default)
                _data = default
                default
            }
        }
    }

    suspend fun saveData(data: AppData) {
        withContext(Dispatchers.IO) {
            _data = data
            dataFile.writeText(gson.toJson(data))
        }
    }

    suspend fun exportToUri(uri: Uri) {
        withContext(Dispatchers.IO) {
            val data = _data ?: loadData()
            context.contentResolver.openOutputStream(uri)?.use { outputStream ->
                outputStream.write(gson.toJson(data).toByteArray())
            }
        }
    }

    suspend fun importFromUri(uri: Uri): AppData {
        return withContext(Dispatchers.IO) {
            val json = context.contentResolver.openInputStream(uri)?.bufferedReader()?.readText() ?: "{}"
            gson.fromJson(json, AppData::class.java)
        }
    }

    private fun createDefaultData(): AppData {
        val cat1 = Category(id = "1", name = "Основные")
        val cat2 = Category(id = "2", name = "Еда")
        val cat3 = Category(id = "3", name = "Напитки")
        val cat4 = Category(id = "4", name = "Игрушки")
        val cat5 = Category(id = "5", name = "Одежда")
        val cat6 = Category(id = "6", name = "Люди")
        val cat7 = Category(id = "7", name = "Эмоции")
        val cat8 = Category(id = "8", name = "Действия")
        val cat9 = Category(id = "9", name = "Общение")
        val cat10 = Category(id = "10", name = "Места")

        val categories = mutableListOf(cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10)

        val cards = mutableMapOf(
            cat1.id to mutableListOf(
                Card("101", "Есть", "🍽️"),
                Card("102", "Пить", "🥤"),
                Card("103", "Спать", "🛏"),
                Card("104", "Туалет", "🚽"),
                Card("105", "Играть", "🎲")
            ),
            cat2.id to mutableListOf(
                Card("201", "Яблоко", "🍎"),
                Card("202", "Банан", "🍌"),
                Card("203", "Печенье", "🍪"),
                Card("204", "Хлеб", "🍞"),
                Card("205", "Сыр", "🧀"),
                Card("206", "Каша", "🥣"),
                Card("207", "Суп", "🍜"),
                Card("208", "Мясо", "🍖")
            ),
            cat3.id to mutableListOf(
                Card("301", "Вода", "💧"),
                Card("302", "Сок", "🧃"),
                Card("303", "Кофе", "☕️"),
                Card("304", "Чай", "🍵")
            ),
            cat4.id to mutableListOf(
                Card("401", "Мишка", "🐻"),
                Card("402", "Машинка", "🚗"),
                Card("403", "Кубики", "🧊"),
                Card("404", "Мяч", "⚽"),
                Card("405", "Кукла", "🎎")
            ),
            cat5.id to mutableListOf(
                Card("501", "Штаны", "👖"),
                Card("502", "Футболка", "👕"),
                Card("503", "Куртка", "🧥"),
                Card("504", "Шапка", "🧢"),
                Card("505", "Носки", "🧦"),
                Card("506", "Обувь", "👟")
            ),
            cat6.id to mutableListOf(
                Card("601", "Мама", "👩"),
                Card("602", "Папа", "👨"),
                Card("603", "Сестра", "👧"),
                Card("604", "Брат", "👦"),
                Card("605", "Бабушка", "👵"),
                Card("606", "Я", "🧒")
            ),
            cat7.id to mutableListOf(
                Card("701", "Радость", "😊"),
                Card("702", "Грусть", "😢"),
                Card("703", "Злость", "😠"),
                Card("704", "Страх", "😨"),
                Card("705", "Устал", "🥱"),
                Card("706", "Спокойный", "😌"),
                Card("707", "Болею", "🤒")
            ),
            cat8.id to mutableListOf(
                Card("801", "Играть", "🧸"),
                Card("802", "Рисовать", "🎨"),
                Card("803", "Смотреть мультики", "📺"),
                Card("804", "Слушать музыка", "🎵"),
                Card("805", "Гулять", "🚶"),
                Card("806", "Читать", "📖"),
                Card("807", "Прыгать", "🤸"),
                Card("808", "Мыться", "🛀")
            ),
            cat9.id to mutableListOf(
                Card("901", "Привет", "🖐️"),
                Card("902", "Пока", "👋"),
                Card("903", "Пожалуйста", "🙏"),
                Card("904", "Спасибо", "🥰"),
                Card("905", "Да", "👍"),
                Card("906", "Нет", "👎"),
                Card("907", "Извини", "😔")
            ),
            cat10.id to mutableListOf(
                Card("1001", "Дом", "🏠"),
                Card("1002", "Школа", "🏫"),
                Card("1003", "Площадка", "🛝"),
                Card("1004", "Магазин", "🏪"),
                Card("1005", "Больница", "🏥"),
                Card("1006", "Парк", "🌳")
            )
        )

        val quickButtons = mutableListOf(
            Card("q1", "Я хочу", "🙋"),
            Card("q2", "Дай", "🫴"),
            Card("q3", "Стоп", "🙅‍♂️"),
            Card("q4", "Помоги", "🆘"),
            Card("q5", "Спасибо", "🥰"),
            Card("q6", "Извини", "😔")
        )

        val yesnoAnswers = mutableListOf(
            Card("y1", "Да", "✅"),
            Card("y2", "Нет", "❌"),
            Card("y3", "хочу", "🙂‍↕️"),
            Card("y4", "Не хочу", "🙂‍↔️"),
            Card("y5", "Не знаю", "🤷"),
            Card("y6", "Помоги", "🆘"),
            Card("y7", "Хочу ещё", "🔄"),
            Card("y8", "Привет", "🖐"),
            Card("y9", "Пока", "👋")
        )

        return AppData(
            categories = categories,
            cards = cards,
            quickButtons = quickButtons,
            yesnoAnswers = yesnoAnswers
        )
    }
}
