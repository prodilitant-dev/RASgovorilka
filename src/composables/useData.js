import { uid } from '@/utils/helpers';

export function useData() {
  // Возвращает полностью заполненный объект данных (как в старой initDefaultData)
  function getDefaultData() {
    const cat1  = { id: uid(), name: "Основные" };
    const cat2  = { id: uid(), name: "Еда" };
    const cat3  = { id: uid(), name: "Напитки" };
    const cat4  = { id: uid(), name: "Игрушки" };
    const cat5  = { id: uid(), name: "Одежда" };
    const cat6  = { id: uid(), name: "Люди" };
    const cat7  = { id: uid(), name: "Эмоции" };
    const cat8  = { id: uid(), name: "Действия" };
    const cat9  = { id: uid(), name: "Общение" };
    const cat10 = { id: uid(), name: "Места" };

    const categories = [cat1, cat2, cat3, cat4, cat5, cat6, cat7, cat8, cat9, cat10];

    const cards = {
      [cat1.id]: [
        { id: uid(), text: "Есть", emoji: "🍽️" },
        { id: uid(), text: "Пить", emoji: "🥤" },
        { id: uid(), text: "Спать", emoji: "🛏" },
        { id: uid(), text: "Туалет", emoji: "🚽" },
        { id: uid(), text: "Играть", emoji: "🎲" },
      ],
      [cat2.id]: [
        { id: uid(), text: "Яблоко", emoji: "🍎" },
        { id: uid(), text: "Банан", emoji: "🍌" },
        { id: uid(), text: "Печенье", emoji: "🍪" },
        { id: uid(), text: "Хлеб", emoji: "🍞" },
        { id: uid(), text: "Сыр", emoji: "🧀" },
        { id: uid(), text: "Каша", emoji: "🥣" },
        { id: uid(), text: "Суп", emoji: "🍜" },
        { id: uid(), text: "Мясо", emoji: "🍖" }
      ],
      [cat3.id]: [
        { id: uid(), text: "Вода", emoji: "💧" },
        { id: uid(), text: "Сок", emoji: "🧃" },
        { id: uid(), text: "Кофе", emoji: "☕️" },
        { id: uid(), text: "Чай", emoji: "🍵" }
      ],
      [cat4.id]: [
        { id: uid(), text: "Мишка", emoji: "🐻" },
        { id: uid(), text: "Машинка", emoji: "🚗" },
        { id: uid(), text: "Кубики", emoji: "🧊" },
        { id: uid(), text: "Мяч", emoji: "⚽" },
        { id: uid(), text: "Кукла", emoji: "🎎" }
      ],
      [cat5.id]: [
        { id: uid(), text: "Штаны", emoji: "👖" },
        { id: uid(), text: "Футболка", emoji: "👕" },
        { id: uid(), text: "Куртка", emoji: "🧥" },
        { id: uid(), text: "Шапка", emoji: "🧢" },
        { id: uid(), text: "Носки", emoji: "🧦" },
        { id: uid(), text: "Обувь", emoji: "👟" }
      ],
      [cat6.id]: [
        { id: uid(), text: "Мама", emoji: "👩" },
        { id: uid(), text: "Папа", emoji: "👨" },
        { id: uid(), text: "Сестра", emoji: "👧" },
        { id: uid(), text: "Брат", emoji: "👦" },
        { id: uid(), text: "Бабушка", emoji: "👵" },
        { id: uid(), text: "Я", emoji: "🧒" }
      ],
      [cat7.id]: [
        { id: uid(), text: "Радость", emoji: "😊" },
        { id: uid(), text: "Грусть", emoji: "😢" },
        { id: uid(), text: "Злость", emoji: "😠" },
        { id: uid(), text: "Страх", emoji: "😨" },
        { id: uid(), text: "Устал", emoji: "🥱" },
        { id: uid(), text: "Спокойный", emoji: "😌" },
        { id: uid(), text: "Болею", emoji: "🤒" }
      ],
      [cat8.id]: [
        { id: uid(), text: "Играть", emoji: "🧸" },
        { id: uid(), text: "Рисовать", emoji: "🎨" },
        { id: uid(), text: "Смотреть мультики", emoji: "📺" },
        { id: uid(), text: "Слушать музыка", emoji: "🎵" },
        { id: uid(), text: "Гулять", emoji: "🚶" },
        { id: uid(), text: "Читать", emoji: "📖" },
        { id: uid(), text: "Прыгать", emoji: "🤸" },
        { id: uid(), text: "Мыться", emoji: "🛀" }
      ],
      [cat9.id]: [
        { id: uid(), text: "Привет", emoji: "🖐️" },
        { id: uid(), text: "Пока", emoji: "👋" },
        { id: uid(), text: "Пожалуйста", emoji: "🙏" },
        { id: uid(), text: "Спасибо", emoji: "🥰" },
        { id: uid(), text: "Да", emoji: "👍" },
        { id: uid(), text: "Нет", emoji: "👎" },
        { id: uid(), text: "Извини", emoji: "😔" }
      ],
      [cat10.id]: [
        { id: uid(), text: "Дом", emoji: "🏠" },
        { id: uid(), text: "Школа", emoji: "🏫" },
        { id: uid(), text: "Площадка", emoji: "🛝" },
        { id: uid(), text: "Магазин", emoji: "🏪" },
        { id: uid(), text: "Больница", emoji: "🏥" },
        { id: uid(), text: "Парк", emoji: "🌳" }
      ]
    };

    // Добавляем imageBase64 и audioBase64
    for (let catId in cards) {
      cards[catId] = cards[catId].map(c => ({...c, imageBase64: null, audioBase64: null}));
    }

    const quickButtons = [
      { id: uid(), text: "Я хочу", emoji: "🙋", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Дай", emoji: "🫴", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Стоп", emoji: "🙅‍♂️", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Помоги", emoji: "🆘", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Спасибо", emoji: "🥰", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Извини", emoji: "😔", imageBase64: null, audioBase64: null }
    ];

    const yesnoAnswers = [
      { id: uid(), text: "Да", emoji: "✅", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Нет", emoji: "❌", imageBase64: null, audioBase64: null },
      { id: uid(), text: "хочу", emoji: "🙂‍↕️", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Не хочу", emoji: "🙂‍↔️", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Не знаю", emoji: "🤷", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Помоги", emoji: "🆘", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Хочу ещё", emoji: "🔄", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Привет", emoji: "🖐", imageBase64: null, audioBase64: null },
      { id: uid(), text: "Пока", emoji: "👋", imageBase64: null, audioBase64: null }
    ];

    return {
      categories,
      cards,
      quickButtons,
      yesnoAnswers,
      visibleModes: { say: true, yesno: true, text: true, timer: true, whatisthis: false, math: false },
      highContrast: false,
      maxSentenceLength: 15,
      greetingText: "Привет",
      greetingEnabled: true,
      timerMinutes: 1,
      timerPhrase: "Время вышло",
      fullscreenEnabled: false
    };
  }

  return { getDefaultData };
}
