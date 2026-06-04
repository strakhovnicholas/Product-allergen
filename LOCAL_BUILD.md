# Локальная сборка Android (без Expo Go и без EAS)

Папка `gradle-8.14.3-bin` из «Загрузок» — это **только Gradle**, не приложение.  
После локальной сборки получите **APK** или установку сразу на телефон.

---

## 1. Что установить один раз

### Android Studio

1. https://developer.android.com/studio  
2. При установке отметьте: **Android SDK**, **Android SDK Platform**, **Android Virtual Device** (эмулятор не обязателен, если есть телефон).

### В Android Studio → SDK Manager

- **SDK Platforms:** Android 14 или 15 (API 34/35)  
- **SDK Tools:** Android SDK Build-Tools, Platform-Tools, **NDK** (если спросит при сборке)

Запомните путь SDK, обычно:

`C:\Users\strah\AppData\Local\Android\Sdk`

### Переменные среды (Windows)

**Параметры → Система → Переменные среды → пользователь:**

| Имя | Значение |
|-----|----------|
| `ANDROID_HOME` | `C:\Users\strah\AppData\Local\Android\Sdk` |
| В `Path` добавить | `%ANDROID_HOME%\platform-tools` |
| В `Path` добавить | `%ANDROID_HOME%\emulator` (опционально) |

Перезапустите PowerShell.

### Файл `android/local.properties` (если Gradle пишет «SDK location not found»)

После `expo prebuild` создайте (или проверьте) файл  
`android\local.properties` — он **не коммитится** в git:

```properties
sdk.dir=C\:\\Users\\strah\\AppData\\Local\\Android\\Sdk
```

Путь должен совпадать с SDK Manager в Android Studio.  
Альтернатива — переменная `ANDROID_HOME` с тем же путём.

Проверка:

```powershell
adb version
```

---

## 2. Телефон по USB

1. **Отладка по USB** включена.  
2. На телефоне нажали **«Разрешить»** для этого ПК.  
3. Проверка:

```powershell
adb devices
```

Должно быть: `R5CWA0ZF2FF    device`

---

## 3. Сборка и установка на телефон (основной способ)

В PowerShell:

```powershell
cd C:\Users\strah\IdeaProjects\Product-allergen-new
npm install
npx.cmd expo prebuild --platform android --clean
node ./scripts/ensure-local-properties.js
npx.cmd expo run:android
```

Или одной командой (скрипт создаёт `local.properties` сам):

```powershell
npm run prebuild:clean
npm run android
```

- **Первый раз** — 20–40+ минут (SDK, Gradle, зависимости).  
- На телефоне появится приложение **Product-allergen** (своя иконка), **не Expo Go**.  
- Дальше для правок кода можно снова `npx.cmd expo run:android` или держать Metro:

```powershell
npx.cmd expo start
```

и открывать уже установленное приложение на телефоне.

---

## 4. Только получить APK-файл (без автоматической установки)

После `expo prebuild`:

```powershell
cd C:\Users\strah\IdeaProjects\Product-allergen-new\android
.\gradlew.bat assembleDebug
```

Готовый APK:

`android\app\build\outputs\apk\debug\app-debug.apk`

Скопируйте на телефон и установите вручную.

Release-версия (меньше размер, нужна подпись):

```powershell
.\gradlew.bat assembleRelease
```

Файл: `android\app\build\outputs\apk\release\app-release.apk`  
(для release может понадобиться keystore — для теста удобнее **debug**).

---

## 5. Удобные команды из package.json

```powershell
npm run prebuild
npm run android
```

---

## Частые ошибки

| Ошибка | Решение |
|--------|---------|
| `SDK location not found` | Создайте `android\local.properties` с `sdk.dir=...` (см. выше) или задайте `ANDROID_HOME` |
| `No Java` / JDK | Android Studio → встроенный JDK 17, в Studio: Settings → Build → Gradle JDK |
| `adb: unauthorized` | На телефоне снова «Разрешить отладку» |
| Открывается Expo Go | Используйте **`expo run:android`**, не клавишу `a` в обычном `expo start` |
| `Downloading gradle-8.14.3-bin.zip` timeout | Скачайте zip вручную с https://gradle.org/releases/ → скопируйте в `%USERPROFILE%\.gradle\wrapper\dists\gradle-8.14.3-bin\<hash>\gradle-8.14.3-bin.zip` (удалите `.part` и `.lck`). Или используйте уже скачанный файл из `Downloads`. |
| Долго качает Gradle | Нормально при первой сборке |

---

## Отличие от EAS

| | Локально | EAS (облако) |
|---|----------|----------------|
| Нужен Android Studio | Да | Нет |
| APK на диске | `android\app\build\outputs\apk\...` | Скачивание с expo.dev |
| Скорость первого раза | Зависит от ПК | Очередь в облаке |
| Приложение на телефоне | То же | То же |

Функции (SQLite, OCR, офлайн) — **одинаковые**.
