# Карта Bible Desktop API

Базовый URL: `https://bible-desktop.com/api`.

Эта карта фиксирует возможности, доступные новой платформе. Полная семантика
ответов, ограничения и импорт данных остаются в документации Bible Desktop;
здесь перечислена граница потребления Biblia App.

## Уже подключено в foundation

| Область | Endpoint | Использование |
|---|---|---|
| Главная | `GET /home` | Счётчики готовых приложений и материалов |
| Библия | `GET /translations` | Каталог переводов и capability Strong |
| Библия | `GET /translations/{code}/books` | Книги выбранного перевода |
| Библия | `GET /translations/{code}/books/{book}/chapters/{chapter}` | Текст главы и стихи |
| Библия | `GET /search/verses` | Поиск по тексту или ссылке |
| Библия | `GET /verses/{id}/strong-tokens` | Слова Strong выбранного стиха |
| Библия | `GET /strong/{number}` | Словарная статья Strong |
| Библия | `GET /verses/{id}/cross-references` | Параллельные места |
| Календарь | `GET /calendar/day` | Праздники, памяти, пост и чтения на дату |
| Иконы | `GET /calendar/icons` | Поиск, изображения, даты и общий каталог |
| Богослужебные тексты | `GET /liturgical/collections` | Каноны, акафисты, Часослов и молитвы |
| Переводчик | `GET /v1/church-slavonic/status` | Доступность и лимиты сервиса |
| Переводчик | `POST /v1/church-slavonic/translate` | Русский/немецкий ↔ церковнославянский |
| OCR | `POST /v1/icon-inscriptions/recognize` | Распознавание и перевод надписей |
| Профили | `POST /v1/profiles` | Создание персональной конфигурации |
| Профили | `GET /v1/profiles/{uuid}` | Загрузка конфигурации по secret |
| Профили | `POST /v1/profiles/recover` | Восстановление по recovery code |
| Материалы | `GET /faith-questions` | Вопросы веры |
| Материалы | `GET /recipes` | Постные рецепты |
| Материалы | `GET /quizzes` | Тесты |
| Материалы | `GET /virtual-tours` | Туры 360° |
| Материалы | `GET /useful-links` | Полезные ресурсы |

## Следующая глубина готовых приложений

### Дополнительные возможности Писания

- `GET /languages`
- `GET /canons/{code}/books`
- `GET /translations/{code}/supplemental-texts`
- `GET|POST /verses/{verse}/notes`

### Календарь и богослужение

- `GET /calendar/service`
- `GET /calendar/icons/saints`
- `GET /calendar/icons/{id}`
- `GET /calendar/icons/{icon}/images/{image}`
- `GET /liturgical/calendar-texts`
- `GET /liturgical/works`
- `GET /liturgical/works/{slug}`
- `GET /liturgical/works/{slug}/versions/{language}`

### Молитвослов

- `GET /prayers`
- `GET /prayers/{id}`
- `GET /prayers/{id}/sections/{section}`

### Профиль и устройства

- `PUT /v1/profiles/{uuid}`
- `GET /v1/profiles/{uuid}/export`
- `DELETE /v1/profiles/{uuid}`
- `PUT /v1/profiles/{uuid}/push-devices`
- `DELETE /v1/profiles/{uuid}/push-devices/{installation}`

### Материалы

- `GET /recipe-categories`
- `GET /recipes/{id}`
- `GET /quizzes/{id}`

## Правила клиента

- публичные ответы API распаковываются централизованно;
- profile secret передаётся только заголовком `X-Profile-Secret`;
- AI/OCR используют документированные `X-Bible-Desktop-Client` и
  `X-Bible-Desktop-Installation`;
- throttling и free tier считаются частью контракта, клиент их не обходит;
- пользовательские POST/PUT/DELETE никогда не кешируются service worker;
- отсутствие данных показывается как empty state, а transport/API error — как
  отдельное состояние с повтором запроса.
