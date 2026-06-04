# PlantUML — auth-service

Все диаграммы для курсовой / документации в формате **PlantUML** (классический UML-стиль: stickman-акторы, жёлтые классы, без «modern» иконок).

## Файлы

| Файл | Диаграмма |
|------|-----------|
| `_style.puml` | Общий стиль (скопирован в каждый файл; после правок запустите `node inline-style.mjs`) |
| `01-use-case.puml` | Use Case |
| `02-sequence-login.puml` | Sequence — вход |
| `03-sequence-register.puml` | Sequence — регистрация |
| `04-sequence-logout.puml` | Sequence — выход |
| `05-sequence-refresh.puml` | Sequence — обновление токенов |
| `06-class.puml` | Class |
| `07-component.puml` | Component |
| `08-deployment.puml` | Deployment |

## Как посмотреть / экспортировать

### VS Code / Cursor
Расширение **PlantUML** → открыть `.puml` → `Alt+D` (preview).

### CLI (нужен Java + Graphviz)
```bash
cd docs/uml/plantuml
java -jar plantuml.jar -tpng *.puml
# или SVG:
java -jar plantuml.jar -tsvg *.puml
```

### Онлайн
Скопировать содержимое файла на https://www.plantuml.com/plantuml/uml

## StarUML

Эти файлы **не** являются проектом StarUML (`.uml`). Если преподаватель требует именно StarUML — откройте PNG/SVG из PlantUML и **перерисуйте** по образцу, либо импортируйте картинку как фон (Model → Add diagram image). Автоматический импорт `.puml` в StarUML v1 не поддерживается.

## Соответствие API

| UC | Метод |
|----|--------|
| UC-01 Регистрация | `POST /auth/register` |
| UC-02 Вход | `POST /auth/login` |
| UC-03 Выход | `POST /auth/logout` |
| UC-04 Обновление | `POST /auth/refresh` |
