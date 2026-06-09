# Физическая модель user-service (PostgreSQL и MongoDB)

> Актуальная версия по репозиторию `Product-allergen-user/user-service`.  
> Заменяет устаревший текст, где дневник и профиль ошибочно отнесены к PostgreSQL.

---

## 2.6.3. Физическая модель user-service (PostgreSQL)

В **user-service** реляционная СУБД **PostgreSQL** (база `user_pg`) используется для **справочников** и **журнала приёма лекарств**. Дневник питания, симптомов, самочувствие и медицинский профиль хранятся в **MongoDB** (см. п. 2.6.4).

В состав схемы `user_pg` входят следующие таблицы:

| Таблица | Назначение |
|---------|------------|
| **food** | Справочник продуктов/блюд пользователя |
| **food_components** | Состав продукта (связь 1:N с `food`, `@ElementCollection`) |
| **symptom** | Справочник названий симптомов (`/api/symptoms`) |
| **medicine** | Справочник лекарственных препаратов (`/api/medicines`) |
| **intake_medicine** | Журнал фактических приёмов лекарств за даты |

Таблица **food** содержит название продукта, категорию и ссылку на пользователя (`user_id`). Компоненты питания вынесены в **food_components** (составной ключ `food_id` + `component`).

Таблица **symptom** хранит шаблоны симптомов (имя и типовая тяжесть 1–10). **Записи дневника** о проявлении симптомов во времени находятся в MongoDB (коллекция `symptoms`), а не в этой таблице.

Таблица **medicine** — справочник препаратов (название, дозировка, единица измерения).

Таблица **intake_medicine** фиксирует приёмы лекарств с датой `intake_date`; именно эти данные запрашивает **analytics-service** при формировании PDF-отчёта.

Связь всех таблиц с учётной записью реализована через поле **user_id** (UUID из auth-service). Межсервисного внешнего ключа на таблицу `users` нет (принцип *Database per Service*).

Для повышения производительности создаются индексы:

- `idx_food_user_id`, `idx_food_name` — таблица `food`;
- `idx_symptom_user_id` — таблица `symptom`;
- `idx_medicine_user_id` — таблица `medicine`;
- `idx_intake_user_id`, `idx_intake_date`, `idx_intake_user_date` — таблица `intake_medicine` (выборка приёмов пользователя за период).

**ВСТАВИТЬ РИСУНОК 2.Х** — `docs/uml/plantuml/database/05-physical-user-postgresql.puml`  
*Подпись:* «Рисунок 2.Х — Физическая модель PostgreSQL user-service».

Использование индексов, в особенности композитного `idx_intake_user_date`, ускоряет выборки за интервал дат при формировании медицинских отчётов в **analytics-service**.

---

## 2.6.4. Физическая модель user-service (MongoDB)

В **user-service** документная СУБД **MongoDB** (база `health_tracker`) используется для данных с гибкой структурой: **медицинский профиль**, **дневник** и **заметки**.

Основные коллекции:

| Коллекция | Назначение |
|-----------|------------|
| **user_info** | Медицинский профиль (1 документ на пользователя) |
| **food_intakes** | Записи дневника питания |
| **symptoms** | Эпизоды симптомов с интервалом начала/окончания |
| **common_feelings** | Оценки самочувствия |
| **notes** | Текстовые заметки |

Коллекции **food_analysis** в реализации **нет**: модуль пищевого анализатора (`/api/food-analyzer/analyze`) вычисляет связи «пищевой компонент — симптом» **на лету** по документам `food_intakes` и `symptoms` за выбранный период.

Пример документа коллекции **food_intakes**:

```json
{
  "_id": "65f12a1b2c3d4e5f6789abcd",
  "foodIntakeId": "8e1b9c2a-4f3d-4a1b-9c2d-1a2b3c4d5e6f",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "foodName": "Йогурт",
  "category": "DAIRY",
  "amount": 150.0,
  "unit": "г",
  "intakeTime": "2025-01-15T10:15:00",
  "createdAt": "2025-01-15T10:16:00",
  "components": ["молоко", "лактоза", "клубника"]
}
```

Для ускорения поиска (скрипт `health_tracker.js`) создаются индексы, в том числе:

- **user_info:** `{ userId: 1 }` (unique), `{ fullName: 1 }`, `{ registeredAt: -1 }`;
- **food_intakes:** `{ userId: 1, intakeTime: -1 }`, `{ foodName: 1 }`, `{ intakeTime: -1 }`;
- **symptoms:** `{ userId: 1, startTime: -1 }`, `{ symptomName: 1 }`, `{ severity: 1 }`;
- **common_feelings:** `{ userId: 1, dateTime: -1 }`, `{ wellbeingScore: 1 }`;
- **notes:** `{ userId: 1, date: -1 }`, текстовый индекс по `content`.

**ВСТАВИТЬ РИСУНОК 2.Х** — `docs/uml/plantuml/database/06-physical-user-mongodb.puml`  
*Подпись:* «Рисунок 2.Х — Физическая модель MongoDB user-service».

Документо-ориентированная структура позволяет хранить профиль и записи дневника без жёсткой нормализации; массивы (аллергены, компоненты питания) и временные поля эпизодов симптомов естественно вкладываются в документ. Эти данные используются клиентским приложением, **analytics-service** и **scan-service** (профиль аллергий через `GET /api/user/info`).

---

## Сопоставление со старым текстом

| Было (устаревшее) | Стало (фактическая реализация) |
|-------------------|--------------------------------|
| PostgreSQL: `user_info`, `food_intake`, `symptoms`, `common_feeling` | PostgreSQL: `food`, `food_components`, `symptom`, `medicine`, `intake_medicine` |
| MongoDB: коллекция `food_analysis` | MongoDB: `user_info`, `food_intakes`, `symptoms`, `common_feelings`, `notes` |
| Индексы `idx_food_user_id` на дневнике в PG | `idx_food_user_id` на справочнике `food`; дневник — индексы в MongoDB |
