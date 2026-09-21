import type { FeatureDefinition, FeatureGroupDefinition, ReadyAppDefinition } from './types'

export const featureGroups: FeatureGroupDefinition[] = [
  { id: 'scripture', title: { ru: 'Писание', de: 'Heilige Schrift' }, description: { ru: 'Читать и изучать Библию', de: 'Die Bibel lesen und studieren' }, icon: 'book' },
  { id: 'prayer', title: { ru: 'Молитва', de: 'Gebet' }, description: { ru: 'Молитвы и богослужебные тексты', de: 'Gebete und liturgische Texte' }, icon: 'prayer' },
  { id: 'calendar', title: { ru: 'Календарь', de: 'Kalender' }, description: { ru: 'Церковный год на каждый день', de: 'Das Kirchenjahr für jeden Tag' }, icon: 'calendar' },
  { id: 'icons', title: { ru: 'Иконы', de: 'Ikonen' }, description: { ru: 'Образы и дни празднования', de: 'Ikonen und ihre Gedenktage' }, icon: 'image' },
  { id: 'slavonic', title: { ru: 'Церковнославянский', de: 'Kirchenslawisch' }, description: { ru: 'Переводить, распознавать и изучать', de: 'Übersetzen, erkennen und lernen' }, icon: 'letters' },
  { id: 'resources', title: { ru: 'Материалы', de: 'Materialien' }, description: { ru: 'Практические и учебные разделы', de: 'Praktische und lehrreiche Inhalte' }, icon: 'link' },
]

export const features: FeatureDefinition[] = [
  {
    id: 'scripture.reader', group: 'scripture', icon: 'book', route: '/scripture', dependencies: [], availability: 'available',
    title: { ru: 'Чтение Библии', de: 'Bibellesen' },
    description: { ru: 'Переводы, книги, главы и настройка текста', de: 'Übersetzungen, Bücher, Kapitel und Textdarstellung' },
    exposure: { builder: true, navigation: true, standalone: true },
    apiCapabilities: ['translations', 'books', 'chapters'], homeStatKey: 'bibles',
  },
  {
    id: 'scripture.search', group: 'scripture', icon: 'search', route: '/scripture/search', dependencies: ['scripture.reader'], availability: 'available',
    title: { ru: 'Поиск по Библии', de: 'Bibelsuche' }, description: { ru: 'Слова, фразы и ссылки на стихи', de: 'Wörter, Phrasen und Bibelstellen' },
    exposure: { builder: true, navigation: false, standalone: false }, apiCapabilities: ['verse-search'],
  },
  {
    id: 'scripture.strong', group: 'scripture', icon: 'letters', route: '/scripture', dependencies: ['scripture.reader'], availability: 'available',
    title: { ru: 'Номера Strong', de: 'Strong-Nummern' }, description: { ru: 'Словарные данные исходных языков', de: 'Wörterbuchdaten der Ausgangssprachen' },
    exposure: { builder: true, navigation: false, standalone: false }, apiCapabilities: ['strong', 'strong-tokens'],
  },
  {
    id: 'scripture.cross-references', group: 'scripture', icon: 'link', route: '/scripture', dependencies: ['scripture.reader'], availability: 'available',
    title: { ru: 'Параллельные места', de: 'Querverweise' }, description: { ru: 'Связанные места Священного Писания', de: 'Verwandte Stellen der Heiligen Schrift' },
    exposure: { builder: true, navigation: false, standalone: false }, apiCapabilities: ['cross-references'],
  },
  {
    id: 'prayer.library', group: 'prayer', icon: 'prayer', route: '/prayer', dependencies: [], availability: 'available',
    title: { ru: 'Молитвослов', de: 'Gebetbuch' }, description: { ru: 'Молитвы для чтения и правила', de: 'Gebete und Gebetsregeln' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['prayers'], homeStatKey: 'prayers',
  },
  {
    id: 'prayer.liturgical', group: 'prayer', icon: 'book', route: '/prayer', dependencies: ['prayer.library'], availability: 'available',
    title: { ru: 'Каноны, акафисты и Часослов', de: 'Kanones, Akathisten und Stundenbuch' },
    description: { ru: 'Богослужебная библиотека и доступные редакции', de: 'Liturgische Bibliothek und verfügbare Ausgaben' },
    exposure: { builder: true, navigation: false, standalone: true }, apiCapabilities: ['liturgical-collections', 'liturgical-works'],
  },
  {
    id: 'calendar.today', group: 'calendar', icon: 'calendar', route: '/calendar', dependencies: [], availability: 'available',
    title: { ru: 'Православный календарь', de: 'Orthodoxer Kalender' }, description: { ru: 'Праздники, пост, чтения и иконы дня', de: 'Feste, Fasten, Lesungen und Ikonen des Tages' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['calendar-day'],
  },
  {
    id: 'icons.catalog', group: 'icons', icon: 'image', route: '/icons', dependencies: [], availability: 'available',
    title: { ru: 'Календарь икон', de: 'Ikonenkalender' }, description: { ru: 'Каталог образов, даты и варианты изображений', de: 'Ikonenkatalog, Gedenktage und Bildvarianten' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['calendar-icons'],
  },
  {
    id: 'slavonic.translator', group: 'slavonic', icon: 'letters', route: '/slavonic', dependencies: [], availability: 'available',
    title: { ru: 'Переводчик', de: 'Übersetzer' }, description: { ru: 'Русский и немецкий ↔ церковнославянский', de: 'Russisch und Deutsch ↔ Kirchenslawisch' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['church-slavonic-translate'],
  },
  {
    id: 'slavonic.ocr', group: 'slavonic', icon: 'image', route: '/slavonic/recognize', dependencies: [], availability: 'available',
    title: { ru: 'Распознавание надписей', de: 'Inschriften erkennen' }, description: { ru: 'Церковнославянские, греческие и смешанные надписи', de: 'Kirchenslawische, griechische und gemischte Inschriften' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['icon-inscriptions-recognize'],
  },
  {
    id: 'slavonic.learning', group: 'slavonic', icon: 'letters', route: '/slavonic/learn', dependencies: [], availability: 'planned',
    title: { ru: 'Азбука и цифирь', de: 'Alphabet und Zahlenschrift' }, description: { ru: 'Буквы, числа, упражнения и повторение', de: 'Buchstaben, Zahlen, Übungen und Wiederholung' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: [],
  },
  {
    id: 'resources.faith', group: 'resources', icon: 'prayer', route: '/resources/faith', dependencies: [], availability: 'available',
    title: { ru: 'Вопросы веры', de: 'Glaubensfragen' }, description: { ru: 'Краткие редакторские ответы', de: 'Kurze redaktionelle Antworten' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['faith-questions'], homeStatKey: 'faith_questions',
  },
  {
    id: 'resources.recipes', group: 'resources', icon: 'food', route: '/resources/recipes', dependencies: [], availability: 'available',
    title: { ru: 'Постные рецепты', de: 'Fastenrezepte' }, description: { ru: 'Категории, ингредиенты и приготовление', de: 'Kategorien, Zutaten und Zubereitung' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['recipes'], homeStatKey: 'recipes',
  },
  {
    id: 'resources.quizzes', group: 'resources', icon: 'quiz', route: '/resources/quizzes', dependencies: [], availability: 'available',
    title: { ru: 'Тесты', de: 'Tests' }, description: { ru: 'Тематические вопросы с пояснениями', de: 'Thematische Fragen mit Erklärungen' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['quizzes'], homeStatKey: 'quizzes',
  },
  {
    id: 'resources.tours', group: 'resources', icon: 'tour', route: '/resources/tours', dependencies: [], availability: 'available',
    title: { ru: 'Храмы и монастыри 360°', de: 'Kirchen und Klöster in 360°' }, description: { ru: 'Виртуальные панорамы и экскурсии', de: 'Virtuelle Panoramen und Rundgänge' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['virtual-tours'], homeStatKey: 'tours',
  },
  {
    id: 'resources.links', group: 'resources', icon: 'link', route: '/resources/links', dependencies: [], availability: 'available',
    title: { ru: 'Полезные материалы', de: 'Nützliche Materialien' }, description: { ru: 'Проверенные проекты и ресурсы', de: 'Ausgewählte Projekte und Ressourcen' },
    exposure: { builder: true, navigation: true, standalone: true }, apiCapabilities: ['useful-links'], homeStatKey: 'materials',
  },
]

export const readyApps: ReadyAppDefinition[] = [
  {
    id: 'scripture', icon: 'book', route: '/scripture',
    title: { ru: 'Писание', de: 'Heilige Schrift' }, description: { ru: 'Читать и изучать Священное Писание', de: 'Die Heilige Schrift lesen und studieren' },
    featureIds: ['scripture.reader', 'scripture.search', 'scripture.strong', 'scripture.cross-references'],
  },
  {
    id: 'prayer', icon: 'prayer', route: '/prayer',
    title: { ru: 'Молитвослов', de: 'Gebetbuch' }, description: { ru: 'Молитвы и богослужебные тексты', de: 'Gebete und liturgische Texte' },
    featureIds: ['prayer.library', 'prayer.liturgical'],
  },
  {
    id: 'calendar', icon: 'calendar', route: '/calendar',
    title: { ru: 'Православный календарь', de: 'Orthodoxer Kalender' }, description: { ru: 'Церковный год на каждый день', de: 'Das Kirchenjahr für jeden Tag' },
    featureIds: ['calendar.today'],
  },
  {
    id: 'icons', icon: 'image', route: '/icons',
    title: { ru: 'Календарь икон', de: 'Ikonenkalender' }, description: { ru: 'Православные образы и дни празднования', de: 'Orthodoxe Ikonen und ihre Gedenktage' },
    featureIds: ['icons.catalog'],
  },
  {
    id: 'slavonic', icon: 'letters', route: '/slavonic',
    title: { ru: 'Церковнославянский', de: 'Kirchenslawisch' }, description: { ru: 'Переводить, распознавать и изучать', de: 'Übersetzen, erkennen und lernen' },
    featureIds: ['slavonic.translator', 'slavonic.ocr', 'slavonic.learning'],
  },
]

export function featureById(id: string): FeatureDefinition | undefined {
  return features.find((feature) => feature.id === id)
}
