// src/utils/inflect/dictionaries.js

/**
 * Особые случаи склонения (слова с нетривиальными формами).
 *
 * ⚠️ Только те слова, для которых в inflectNoun.js есть спец-обработка.
 * Остальные (обычные существительные, несклоняемые) обрабатываются
 * общими эвристиками или словарями indeclinable.js / fleetingVowels.js.
 */
export const nounExceptions = {
  'ребёнок': { type: 'noun', gender: 'masculine', animate: true },
  'человек': { type: 'noun', gender: 'masculine', animate: true },
  'ухо':     { type: 'noun', gender: 'neuter',    animate: false },
  'глаз':    { type: 'noun', gender: 'masculine', animate: false },
  'бобр':    { type: 'noun', gender: 'masculine', animate: true },
  'ёж':      { type: 'noun', gender: 'masculine', animate: true },
  'белка':   { type: 'noun', gender: 'feminine',  animate: true },
  'лошадь':  { type: 'noun', gender: 'feminine',  animate: true },
  'мать':    { type: 'noun', gender: 'feminine',  animate: true },
  'дочь':    { type: 'noun', gender: 'feminine',  animate: true },
  'путь':    { type: 'noun', gender: 'masculine', animate: false },
  // Слова на -мя
  'время':   { type: 'noun', gender: 'neuter', animate: false },
  'имя':     { type: 'noun', gender: 'neuter', animate: false },
  'семя':    { type: 'noun', gender: 'neuter', animate: false },
  'знамя':   { type: 'noun', gender: 'neuter', animate: false },
  'племя':   { type: 'noun', gender: 'neuter', animate: false },
  'бремя':   { type: 'noun', gender: 'neuter', animate: false },
  'темя':    { type: 'noun', gender: 'neuter', animate: false },
  'вымя':    { type: 'noun', gender: 'neuter', animate: false },
};

// ---- Окончания для определения частей речи ----
export const adjEndings = ['ый', 'ий', 'ой', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие', 'ого', 'его', 'ому', 'ему', 'ым', 'им', 'ом', 'ем'];
export const verbEndings = ['ть', 'ти', 'чь', 'тся', 'ться', 'ю', 'ешь', 'ет', 'ем', 'ете', 'ют', 'ит', 'ат', 'ят', 'л', 'ла', 'ло', 'ли', 'й', 'йте'];

// ---- Местоимения ----
export const pronouns = ['я', 'ты', 'он', 'она', 'оно', 'мы', 'вы', 'они', 'себя', 'кто', 'что', 'чей', 'какой', 'который', 'такой', 'этот', 'весь', 'всякий', 'каждый', 'другой', 'некто', 'нечто', 'никто', 'ничто', 'некий', 'сам', 'сама', 'само', 'сами'];

// ---- Предлоги и соответствующие падежи ----
export const prepMap = {
  'в': 'accusative', 'во': 'accusative',
  'на': 'accusative',
  'за': 'accusative',
  'через': 'accusative',
  'про': 'accusative',
  'сквозь': 'accusative',
  'под': 'instrumental',
  'над': 'instrumental',
  'перед': 'instrumental',
  'между': 'instrumental',
  'к': 'dative', 'ко': 'dative',
  'по': 'dative',
  'от': 'genitive', 'ото': 'genitive',
  'из': 'genitive', 'изо': 'genitive',
  'с': 'genitive', 'со': 'genitive',
  'без': 'genitive',
  'для': 'genitive',
  'до': 'genitive',
  'у': 'genitive',
  'около': 'genitive',
  'ради': 'genitive',
  'после': 'genitive',
  'среди': 'genitive',
  'против': 'genitive',
  'возле': 'genitive',
  'вокруг': 'genitive',
  'мимо': 'genitive',
  'напротив': 'genitive',
  'позади': 'genitive',
  'вблизи': 'genitive',
  'о': 'prepositional', 'об': 'prepositional',
  'при': 'prepositional'
};

// ---- Глаголы, управляющие падежом ----
export const verbCaseMap = {
  'хочу': 'accusative', 'хотеть': 'accusative',
  'люблю': 'accusative', 'любить': 'accusative',
  'вижу': 'accusative', 'видеть': 'accusative',
  'слышу': 'accusative', 'слышать': 'accusative',
  'знаю': 'accusative', 'знать': 'accusative',
  'понимаю': 'accusative', 'понимать': 'accusative',
  'купи': 'accusative', 'купить': 'accusative',
  'дай': 'dative', 'дать': 'dative',
  'возьми': 'accusative', 'взять': 'accusative',
  'прошу': 'accusative', 'просить': 'accusative',
  'жду': 'accusative', 'ждать': 'accusative',
  'ищу': 'accusative', 'искать': 'accusative',
  'ел': 'accusative', 'есть': 'accusative',
  'пью': 'accusative', 'пить': 'accusative',
  'нет': 'genitive',
  'не было': 'genitive',
  'не будет': 'genitive'
};