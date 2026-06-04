# scan-service — PlantUML

Поток: **фото** → `POST /scan/analyze` (gateway) → **Kafka** (`scan-image-requests`) → consumer → **GigaChat Vision** (JSON) → парсинг → классификация по профилю → ответ **safe / caution / unsafe**.

| Файл | Диаграмма |
|------|-----------|
| `01-use-case.puml` | Варианты использования |
| `02-sequence-analyze.puml` | Сквозной сценарий (фото → Kafka → GigaChat → клиент) |
| `03-sequence-gigachat.puml` | OAuth + Vision + парсинг JSON |
| `04-sequence-kafka.puml` | Producer / consumer, correlationId |
| `05-sequence-feign.puml` | Профиль через gateway → user-service |
| `06-class.puml` | Классы |
| `07-component.puml` | Компоненты |
| `08-deployment.puml` | Развёртывание (VPS, Kafka, GigaChat) |

Копия для диплома: `OneDrive\Рабочий стол\Диаграммы\scan\`.

Просмотр: PlantUML Preview (`Alt+D`).
