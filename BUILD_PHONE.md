# Установка Product-allergen на телефон (Android)

## Что уже работает в приложении

- **Offline-first**: дневник, профиль и заметки сохраняются в **SQLite** (`expo-sqlite`).
- **Синхронизация**: при появлении сети очередь `sync_queue` отправляет данные на ваш gateway.
- **Сканер**: фото этикетки → OCR на устройстве (ML Kit) → проверка аллергенов **без GigaChat**.
- **Отчёты**: статистика из локальной БД + **PDF на устройстве** (`expo-print`), без ИИ.

> **Expo Go** подходит для проверки дневника и офлайн-записей.  
> **OCR и полный сканер** нужен **собранный APK** (development build), потому что ML Kit — нативный модуль.

---

## Вариант A — быстро на свой телефон (рекомендуется): EAS Build → APK

### 1. Установите инструменты

- [Node.js](https://nodejs.org/) LTS
- Аккаунт [Expo](https://expo.dev/signup) (бесплатно)

```powershell
cd C:\Users\strah\IdeaProjects\Product-allergen-new
npm install
npm install -g eas-cli
eas login
```

### 2. Привяжите проект к EAS (один раз)

```powershell
eas init
```

Скопируйте выданный `projectId` в `app.json` → `expo.extra.eas.projectId`.

### 3. Соберите APK в облаке

```powershell
eas build --platform android --profile preview
```

Дождитесь окончания (10–20 мин). В консоли или на [expo.dev](https://expo.dev) появится **ссылка на скачивание `.apk`**.

### 4. Установите на телефон

1. Скачайте APK на телефон (или перекиньте USB / Telegram).
2. **Настройки → Безопасность** → разрешите установку из неизвестных источников для браузера/файлов.
3. Откройте APK и установите.

### 5. Первый запуск

1. Подключитесь к интернету.
2. **Регистрация / вход** — токены сохранятся, профиль подтянется с сервера.
3. Дальше можно работать **без сети**: дневник, сканер (в APK), PDF-отчёты.

URL API: `src/api/config.ts` → `http://79.133.178.179:8080` (должен быть доступен с телефона).

---

## Вариант B — сборка на своём ПК (USB-отладка)

Нужны: Android Studio, SDK, включённая **отладка по USB** на телефоне.

```powershell
cd C:\Users\strah\IdeaProjects\Product-allergen-new
npm install
npx expo prebuild --platform android
npx expo run:android
```

Телефон по USB → приложение установится автоматически.

---

## Вариант C — только разработка без APK (Expo Go)

```powershell
npm install
npx expo start
```

Отсканируйте QR в приложении **Expo Go**.

- Дневник, офлайн SQLite, отчёты — **да**.
- OCR по фото — **нет** (используйте «Ввести текст состава вручную» на экране сканера).

---

## Ручной ввод состава (если OCR недоступен)

Экран **Камера** → «Ввести текст состава вручную» → вставьте текст с этикетки → **Анализировать текст**.

---

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| `Network request failed` при входе | Сервер на **HTTP** (`http://79.133.178.179:8080`). В release-APK Android блокирует HTTP — в `app.json` включён `usesCleartextTraffic: true`. **Пересоберите APK** на expo.dev и установите заново. |
| Не логинится (другая ошибка) | Проверьте email/пароль; сервер должен отвечать (не «network failed») |
| OCR не работает | Установите APK из EAS, не Expo Go |
| Данные не на сервере | Откройте приложение онлайн — сработает sync очереди |
| Ошибка при `eas build` | Выполните `eas init`, укажите `projectId` в `app.json` |
| `Build request failed` сразу после upload | Часто **временный сбой Expo** — повторите через 1–2 мин: `eas build --platform android --profile preview --clear-cache`. Смотрите детали: `$env:EXPO_DEBUG=1; eas build ...`. Не запускайте 2 сборки одновременно (free plan). |

---

## Структура офлайн-кода

- `src/db/` — SQLite схема и репозиторий
- `src/api/offlineDiaryApi.ts` — дневник offline-first
- `src/api/offlineProfileApi.ts` — профиль offline-first
- `src/offline/syncService.ts` — синхронизация с backend
- `src/ocr/` — парсер состава и проверка аллергенов
- `src/services/localReportPdf.ts` — PDF без ИИ
