import { Platform } from 'react-native';

/** Все даты в приложении — по московскому времени (МСК, UTC+3). */
export const APP_TIME_ZONE = 'Europe/Moscow';

const MOSCOW_OFFSET = '+03:00';

type NativePickerEvent = { type?: string };

type ZonedParts = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

function pad2(value: number | string) {
  return String(value).padStart(2, '0');
}

function getZonedParts(date: Date, timeZone = APP_TIME_ZONE): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      parts[part.type] = part.value;
    }
  }

  return {
    year: parts.year ?? '1970',
    month: parts.month ?? '01',
    day: parts.day ?? '01',
    hour: parts.hour ?? '00',
    minute: parts.minute ?? '00',
    second: parts.second ?? '00',
  };
}

/** Текущие дата и время в МСК: `YYYY-MM-DDTHH:mm:ss`. */
export function nowAppDateTimeString(): string {
  return toAppDateTimeString(new Date());
}

/** День из строки даты/времени: `YYYY-MM-DD`. */
export function toDayKeyFromDateTime(value: string): string {
  const trimmed = value.trim();
  const naive = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  if (naive) return naive[1];
  const parsed = parseAppDateTime(trimmed);
  return toAppDayKey(parsed);
}

export function isInDayRange(dateTime: string, fromDay: string, toDay: string): boolean {
  const day = toDayKeyFromDateTime(dateTime);
  return day >= fromDay && day <= toDay;
}

/** Все календарные дни МСК от `fromDay` до `toDay` включительно (`YYYY-MM-DD`). */
export function eachAppDayKeyInRange(fromDay: string, toDay: string): string[] {
  if (fromDay > toDay) return [];
  const days: string[] = [];
  let current = parseAppDateTime(`${fromDay}T12:00:00`);
  const end = parseAppDateTime(`${toDay}T12:00:00`);
  while (current.getTime() <= end.getTime()) {
    days.push(toAppDayKey(current));
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
  }
  return days;
}

/** День в МСК: `YYYY-MM-DD`. */
export function toAppDayKey(value: Date | string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const naive = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (naive && !trimmed.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(trimmed)) {
      return naive[1];
    }
  }
  const date = typeof value === 'string' ? parseAppDateTime(value) : value;
  const parts = getZonedParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** Момент времени из строки API/SQLite (без сдвига МСК ↔ UTC). */
export function parseAppDateTime(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) return new Date();

  const naive = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (naive) {
    const [, y, mo, d, h = '12', mi = '00', s = '00'] = naive;
    return new Date(`${y}-${mo}-${d}T${pad2(h)}:${pad2(mi)}:${pad2(s)}${MOSCOW_OFFSET}`);
  }

  return new Date(trimmed);
}

/** Сохранение/отправка: `YYYY-MM-DDTHH:mm:ss` в МСК. */
export function toAppDateTimeString(date: Date): string {
  const parts = getZonedParts(date);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

/** @deprecated Используйте toAppDateTimeString */
export const toLocalDateTimeString = toAppDateTimeString;

export function toAppDateTimeFromDayKey(
  dayKey: string,
  hours = 12,
  minutes = 0,
  seconds = 0,
): string {
  return `${dayKey}T${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

/** @deprecated Используйте toAppDateTimeFromDayKey */
export const toLocalDateTimeFromDayKey = toAppDateTimeFromDayKey;

/**
 * Нормализует ввод в `YYYY-MM-DDTHH:mm:ss` (МСК).
 * `fallbackDayKey` — выбранный день в дневнике (`YYYY-MM-DD`).
 */
export function normalizeDateTimeForStorage(
  value: string | undefined,
  fallbackDayKey: string,
): string {
  if (!value?.trim()) {
    return toAppDateTimeFromDayKey(fallbackDayKey);
  }

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return toAppDateTimeFromDayKey(trimmed);
  }

  const localMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:\d{2})?/);
  if (localMatch && !trimmed.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return localMatch[2] ? trimmed.slice(0, 19) : `${localMatch[1]}:00`;
  }

  const parsed = parseAppDateTime(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return toAppDateTimeFromDayKey(fallbackDayKey);
  }

  return toAppDateTimeString(parsed);
}

export function formatAppDateTime(
  value: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) return '-';
  const parsed = parseAppDateTime(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString('ru-RU', {
    timeZone: APP_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

export function formatAppScheduleDisplay(dateTime: string) {
  const parsed = parseAppDateTime(dateTime);
  if (Number.isNaN(parsed.getTime())) {
    return { date: 'Выберите дату', time: '—' };
  }
  return {
    date: parsed.toLocaleDateString('ru-RU', {
      timeZone: APP_TIME_ZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    }),
    time: parsed.toLocaleTimeString('ru-RU', {
      timeZone: APP_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/** Значение для `<input type="datetime-local" />` (часы в МСК). */
export function toAppDateTimeInputValue(dateTime: string): string {
  const parsed = parseAppDateTime(dateTime);
  if (Number.isNaN(parsed.getTime())) return '';
  const parts = getZonedParts(parsed);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function parsePickerDate(dateTime: string | undefined): Date {
  if (!dateTime?.trim()) return new Date();
  const parsed = parseAppDateTime(dateTime);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Android: два диалога (дата → время). Не монтируем RNDateTimePicker — иначе
 * при unmount падает dismiss для mode=datetime (нет такого picker в SDK).
 */
export function openAndroidDateTimePicker(
  dateTime: string | undefined,
  onChange: (event: NativePickerEvent, date?: Date) => void,
): void {
  if (Platform.OS !== 'android') return;

  const { DateTimePickerAndroid } = require('@react-native-community/datetimepicker');
  const initial = parsePickerDate(dateTime);

  const initialParts = getZonedParts(initial);

  DateTimePickerAndroid.open({
    value: initial,
    mode: 'date',
    is24Hour: true,
    onChange: (event: NativePickerEvent, selectedDate?: Date) => {
      if (event.type === 'dismissed') {
        onChange(event, selectedDate);
        return;
      }
      if (event.type !== 'set' || !selectedDate) return;

      const picked = {
        y: selectedDate.getFullYear(),
        m: selectedDate.getMonth() + 1,
        d: selectedDate.getDate(),
      };
      const merged = parseAppDateTime(
        `${picked.y}-${pad2(picked.m)}-${pad2(picked.d)}T${initialParts.hour}:${initialParts.minute}:${initialParts.second}`,
      );

      DateTimePickerAndroid.open({
        value: merged,
        mode: 'time',
        is24Hour: true,
        onChange: (timeEvent: NativePickerEvent, timeDate?: Date) => {
          if (timeEvent.type === 'set' && timeDate) {
            const asMoscow = parseAppDateTime(
              `${picked.y}-${pad2(picked.m)}-${pad2(picked.d)}T${pad2(timeDate.getHours())}:${pad2(timeDate.getMinutes())}:00`,
            );
            onChange(timeEvent, asMoscow);
            return;
          }
          onChange(timeEvent, timeDate);
        },
      });
    },
  });
}
