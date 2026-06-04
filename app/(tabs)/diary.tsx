import { ScreenSafeArea } from '../../components/ScreenSafeArea';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    CommonFeeling,
    createFoodApi,
    createMedicineApi,
    createNoteApi,
    createSymptomApi,
    deleteCommonFeelingApi,
    deleteFoodApi,
    deleteMedicineApi,
    deleteNoteApi,
    deleteSymptomApi,
    EntityId,
    Food,
    getCommonFeelingsByDateApi,
    getFoodByDateApi,
    getMedicinesByDateApi,
    getMedicinesCatalogApi,
    getNotesByDateApi,
    getSymptomsByDateApi,
    getSymptomsCatalogApi,
    Medicine,
    Note,
    searchFoodCatalogApi,
    Symptom,
    updateCommonFeelingApi,
    updateFoodApi,
    updateMedicineApi,
    updateNoteApi,
    updateSymptomApi,
    upsertCommonFeelingApi
} from '../../src/api/diaryApi';
import { TOP_FOOD_CATALOG } from '../../src/constants/foodCatalog';
import { getUserProfileApi, type Profile as UserProfile } from '../../src/api/profileApi';
import { COLORS, withAlpha } from '../../src/styles/palette';
import {
  formatAppDateTime,
  formatAppScheduleDisplay,
  normalizeDateTimeForStorage,
  nowAppDateTimeString,
  openAndroidDateTimePicker,
  parseAppDateTime,
  toAppDateTimeInputValue,
  toAppDateTimeString,
  toAppDayKey,
} from '../../src/utils/datetime';

type EditorType = 'common' | 'symptom' | 'medicine' | 'food' | 'note';

/** Цвета секций — как на экране отчётов (palette.ts) */
const SECTION_COLORS = {
  common: COLORS.danger,
  symptom: COLORS.primary,
  medicine: COLORS.success,
  food: COLORS.primary,
  note: COLORS.warning,
} as const;
const NativeDateTimePicker =
  Platform.OS === 'web' ? null : require('@react-native-community/datetimepicker').default;

const DEFAULT_SYMPTOMS = [
  'Насморк',
  'Заложенность носа',
  'Чихание',
  'Кашель',
  'Одышка',
  'Боль в горле',
  'Покраснение глаз',
  'Слезотечение',
  'Зуд кожи',
  'Сыпь',
  'Крапивница',
  'Отек губ',
  'Отек век',
  'Отек горла',
  'Тошнота',
  'Боль в животе',
  'Изжога',
  'Диарея',
  'Головная боль',
  'Головокружение',
  'Слабость',
  'Повышенная температура',
  'Озноб',
  'Сонливость',
  'Раздражительность',
  'Учащенное сердцебиение',
];

const DEFAULT_MEDICINES = [
  'Цетиризин',
  'Лоратадин',
  'Дезлоратадин',
  'Фексофенадин',
  'Супрастин',
  'Тавегил',
  'Эриус',
  'Зиртек',
  'Кларитин',
  'Фенистил',
  'Полисорб',
  'Энтеросгель',
  'Смекта',
  'Активированный уголь',
  'Парацетамол',
  'Ибупрофен',
  'Но-шпа',
  'Мезим',
  'Креон',
  'Омепразол',
  'Називин',
  'Аквамарис',
  'Сальбутамол',
  'Беродуал',
  'Преднизолон',
];

const MEDICINE_UNIT_LABELS: Record<string, string> = {
  MG: 'мг',
  ML: 'мл',
  TABLET: 'таб',
  DROP: 'кап',
};

const MEDICINE_QUICK_DOSES: Record<'MG' | 'ML' | 'TABLET' | 'DROP', string[]> = {
  MG: ['25', '50', '100', '250'],
  ML: ['2.5', '5', '10', '15'],
  TABLET: ['0.5', '1', '2', '3'],
  DROP: ['5', '10', '15', '20'],
};

const MEDICINE_UNIT_META: Record<
  'MG' | 'ML' | 'TABLET' | 'DROP',
  { icon: keyof typeof Ionicons.glyphMap; title: string; hint: string }
> = {
  MG: { icon: 'fitness-outline', title: 'мг', hint: 'масса' },
  ML: { icon: 'water-outline', title: 'мл', hint: 'объём' },
  TABLET: { icon: 'ellipse-outline', title: 'таб', hint: 'таблетки' },
  DROP: { icon: 'water', title: 'кап', hint: 'капли' },
};

const formatScheduleDisplay = formatAppScheduleDisplay;

function applyNativeDatePick(
  event: { type?: string },
  selectedDate: Date | undefined,
  onApply: (date: Date) => void,
  onClose: () => void,
) {
  if (Platform.OS === 'android') {
    if (event.type === 'dismissed') {
      onClose();
      return;
    }
    if (event.type === 'set' && selectedDate) {
      onApply(selectedDate);
      onClose();
    }
    return;
  }
  if (selectedDate) {
    onApply(selectedDate);
  }
}

type ScheduleTheme = 'green' | 'blue' | 'rose' | 'orange' | 'amber';

const NOTE_TEMPLATES = [
  'После обеда появилась реакция',
  'Симптомы усилились к вечеру',
  'После лекарства стало лучше',
  'Подозрение на продукт-триггер',
] as const;

const NOTE_TAGS = ['Триггер', 'Лекарство', 'Симптом', 'Питание'] as const;

const SCHEDULE_THEME_STYLES: Record<
  ScheduleTheme,
  {
    card: object;
    iconWrap: object;
    iconColor: string;
    date: object;
    time: object;
    action: object;
    actionText: object;
    webInput: object;
    doneBtn: object;
    doneText: object;
  }
> = {
  green: {
    card: { borderColor: '#A7F3D0', backgroundColor: '#F8FFFB' },
    iconWrap: { backgroundColor: '#ECFDF5' },
    iconColor: '#059669',
    date: { color: '#064E3B' },
    time: { color: '#059669' },
    action: { backgroundColor: '#ECFDF5' },
    actionText: { color: '#047857' },
    webInput: {
      borderColor: '#A7F3D0',
      backgroundColor: '#FFFFFF',
      color: '#064E3B',
    },
    doneBtn: { backgroundColor: '#059669' },
    doneText: { color: '#FFFFFF' },
  },
  blue: {
    card: { borderColor: '#BFDBFE', backgroundColor: '#F8FBFF' },
    iconWrap: { backgroundColor: '#EFF6FF' },
    iconColor: '#1D4ED8',
    date: { color: '#0F172A' },
    time: { color: '#1D4ED8' },
    action: { backgroundColor: '#EFF6FF' },
    actionText: { color: '#1D4ED8' },
    doneBtn: { backgroundColor: '#1D4ED8' },
    doneText: { color: '#FFFFFF' },
  },
  rose: {
    card: { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' },
    iconWrap: { backgroundColor: '#FFE4E6' },
    iconColor: '#E11D48',
    date: { color: '#881337' },
    time: { color: '#E11D48' },
    action: { backgroundColor: '#FFE4E6' },
    actionText: { color: '#BE123C' },
    doneBtn: { backgroundColor: '#E11D48' },
    doneText: { color: '#FFFFFF' },
  },
  orange: {
    card: { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' },
    iconWrap: { backgroundColor: '#FFEDD5' },
    iconColor: '#EA580C',
    date: { color: '#7C2D12' },
    time: { color: '#EA580C' },
    action: { backgroundColor: '#FFEDD5' },
    actionText: { color: '#C2410C' },
    doneBtn: { backgroundColor: '#EA580C' },
    doneText: { color: '#FFFFFF' },
  },
  amber: {
    card: { borderColor: '#FDE68A', backgroundColor: '#FFFBEB' },
    iconWrap: { backgroundColor: '#FEF3C7' },
    iconColor: '#D97706',
    date: { color: '#78350F' },
    time: { color: '#D97706' },
    action: { backgroundColor: '#FEF3C7' },
    actionText: { color: '#B45309' },
    doneBtn: { backgroundColor: '#D97706' },
    doneText: { color: '#FFFFFF' },
  },
};

function EditorScheduleSection({
  theme,
  label,
  dateTime,
  showPicker,
  optional,
  onOpenPicker,
  onPickerChange,
  onClosePicker,
}: {
  theme: ScheduleTheme;
  label: string;
  dateTime: string;
  showPicker: boolean;
  optional?: boolean;
  onOpenPicker: () => void;
  onPickerChange: (event: { type?: string }, date?: Date) => void;
  onClosePicker: () => void;
}) {
  const palette = SCHEDULE_THEME_STYLES[theme];
  const schedule = formatScheduleDisplay(dateTime);
  const hasValue = Boolean(dateTime?.trim());

  const handleOpenPicker = () => {
    if (Platform.OS === 'android') {
      openAndroidDateTimePicker(dateTime, onPickerChange);
      return;
    }
    onOpenPicker();
  };

  return (
    <View style={styles.editorScheduleBlock}>
      <Text style={styles.editorSectionTitle}>{label}</Text>
      {Platform.OS === 'web' ? (
        <View style={[styles.editorScheduleWebField, palette.card]}>
          <View style={[styles.editorScheduleIcon, palette.iconWrap]}>
            <Ionicons name="calendar-outline" size={18} color={palette.iconColor} />
          </View>
          <input
            style={{ ...styles.editorWebDateInputInline, ...palette.webInput } as any}
            type="datetime-local"
            value={toAppDateTimeInputValue(dateTime)}
            onChange={(event) => {
              if (!event.target.value) {
                if (optional) {
                  onPickerChange({ type: 'set' }, undefined);
                }
                return;
              }
              const nextDate = parseAppDateTime(event.target.value);
              if (!Number.isNaN(nextDate.getTime())) {
                onPickerChange({ type: 'set' }, nextDate);
              }
            }}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.editorScheduleCard, palette.card]}
          activeOpacity={0.88}
          onPress={handleOpenPicker}
        >
          <View style={[styles.editorScheduleIcon, palette.iconWrap]}>
            <Ionicons name="time-outline" size={20} color={palette.iconColor} />
          </View>
          <View style={styles.editorScheduleText}>
            <Text style={[styles.editorScheduleDate, palette.date]}>
              {hasValue ? schedule.date : optional ? 'Не указано' : 'Нажмите, чтобы выбрать'}
            </Text>
            <Text style={[styles.editorScheduleTime, palette.time]}>
              {hasValue ? schedule.time : '—'}
            </Text>
          </View>
          <View style={[styles.editorScheduleAction, palette.action]}>
            <Text style={[styles.editorScheduleActionText, palette.actionText]}>Изменить</Text>
            <Ionicons name="chevron-forward" size={14} color={palette.iconColor} />
          </View>
        </TouchableOpacity>
      )}

      {Platform.OS === 'ios' &&
        NativeDateTimePicker &&
        showPicker && (
          <View style={styles.editorPickerWrap}>
            <NativeDateTimePicker
              value={parseAppDateTime(dateTime || nowAppDateTimeString())}
              mode="datetime"
              display="spinner"
              onChange={(event, selectedDate) => onPickerChange(event, selectedDate)}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.editorPickerDone, palette.doneBtn]}
                activeOpacity={0.85}
                onPress={onClosePicker}
              >
                <Text style={[styles.editorPickerDoneText, palette.doneText]}>Готово</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
    </View>
  );
}

const FOOD_UNIT_LABELS: Record<string, string> = {
  GRAM: 'г',
  PORTION: 'порц',
  PIECE: 'шт',
  MILLILITER: 'мл',
};

const FOOD_QUICK_AMOUNTS: Record<'GRAM' | 'PORTION' | 'PIECE' | 'MILLILITER', string[]> = {
  GRAM: ['50', '100', '150', '200'],
  PORTION: ['0.5', '1', '1.5', '2'],
  PIECE: ['1', '2', '3', '4'],
  MILLILITER: ['100', '200', '250', '500'],
};

const FOOD_UNIT_META: Record<
  'GRAM' | 'PORTION' | 'PIECE' | 'MILLILITER',
  { icon: keyof typeof Ionicons.glyphMap; title: string; hint: string }
> = {
  GRAM: { icon: 'scale-outline', title: 'г', hint: 'граммы' },
  PORTION: { icon: 'restaurant-outline', title: 'порц', hint: 'порция' },
  PIECE: { icon: 'cube-outline', title: 'шт', hint: 'штуки' },
  MILLILITER: { icon: 'water-outline', title: 'мл', hint: 'объём' },
};

const FOOD_CATEGORY_LABELS: Record<string, string> = {
  FRUIT: 'Фрукты',
  VEGETABLE: 'Овощи',
  MEAT: 'Мясо',
  FISH: 'Рыба',
  DAIRY: 'Молочные продукты',
  GRAINS: 'Крупы и злаки',
  NUTS: 'Орехи',
  LEGUMES: 'Бобовые',
  FAST_FOOD: 'Фастфуд',
  BEVERAGES: 'Напитки',
  SWEETS: 'Сладости',
  GARNISH: 'Гарниры',
  SOUP: 'Супы',
  OTHER: 'Другое',
};

function toSeverityLabel(value: number) {
  if (value >= 7) return 'Сильно';
  if (value >= 4) return 'Умеренно';
  return 'Слабо';
}

function toFiveScale(value: number) {
  if (!Number.isFinite(value)) return 3;
  const normalized = value > 5 ? Math.round(value / 2) : Math.round(value);
  return Math.max(1, Math.min(5, normalized));
}

function formatDate(date: string) {
  return formatAppDateTime(date);
}

function formatDayLabel(value: Date) {
  return value.toLocaleDateString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isInSelectedDate(date: string, selectedDateKey: string) {
  if (!date) return false;
  return toAppDayKey(date) === selectedDateKey;
}

function getUserDisplayName(profile: UserProfile | null) {
  const fullName = profile?.fullName?.trim();
  if (!fullName) return 'Здравствуйте';
  const name = fullName.split(' ')[0];
  return `Здравствуйте, ${name}`;
}

const WELLBEING_OPTIONS = [
  { score: 1, label: 'Плохо', emoji: '😣', short: '1' },
  { score: 2, label: 'Ниже среднего', emoji: '😕', short: '2' },
  { score: 3, label: 'Нормально', emoji: '😐', short: '3' },
  { score: 4, label: 'Хорошо', emoji: '🙂', short: '4' },
  { score: 5, label: 'Отлично', emoji: '😄', short: '5' },
] as const;

function CommonFeelingInlineEditor({
  editorId,
  score,
  dateTime,
  saving,
  showDatePicker,
  onSelectScore,
  onOpenDatePicker,
  onDatePickerChange,
  onCloseDatePicker,
  onCancel,
  onSave,
}: {
  editorId: EntityId | null;
  score: string;
  dateTime: string;
  saving: boolean;
  showDatePicker: boolean;
  onSelectScore: (value: string) => void;
  onOpenDatePicker: () => void;
  onDatePickerChange: (event: { type?: string }, date?: Date) => void;
  onCloseDatePicker: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const selectedScore = Math.max(1, Math.min(5, Number(score || '3')));
  const selected =
    WELLBEING_OPTIONS.find((item) => item.score === selectedScore) ?? WELLBEING_OPTIONS[2];

  return (
    <View style={styles.wellbeingEditor}>
      <View style={styles.wellbeingHero}>
        <View style={styles.wellbeingHeroGlow} />
        <View style={styles.wellbeingHeroRow}>
          <View style={styles.wellbeingHeroIconWrap}>
            <Ionicons name="heart" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.wellbeingHeroText}>
            <Text style={styles.wellbeingHeroTitle}>
              {editorId != null ? 'Редактирование' : 'Новая запись'}
            </Text>
            <Text style={styles.wellbeingHeroSubtitle}>Как вы себя чувствуете сегодня?</Text>
          </View>
          <View style={styles.wellbeingHeroPill}>
            <Text style={styles.wellbeingHeroPillEmoji}>{selected.emoji}</Text>
            <Text style={styles.wellbeingHeroPillValue}>{selectedScore}/5</Text>
          </View>
        </View>
      </View>

      <View style={styles.editorSection}>
        <Text style={[styles.editorSectionTitle, styles.wellbeingSectionTitle]}>Оценка</Text>
        <View style={styles.wellbeingScoreGrid}>
          {WELLBEING_OPTIONS.map((item) => {
            const active = selectedScore === item.score;
            return (
              <TouchableOpacity
                key={item.score}
                style={[styles.wellbeingScoreCard, active && styles.wellbeingScoreCardActive]}
                activeOpacity={0.88}
                onPress={() => onSelectScore(String(item.score))}
              >
                <Text style={styles.wellbeingScoreCardEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.wellbeingScoreCardNumber,
                    active && styles.wellbeingScoreCardNumberActive,
                  ]}
                >
                  {item.short}
                </Text>
                <Text
                  style={[
                    styles.wellbeingScoreCardLabel,
                    active && styles.wellbeingScoreCardLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                {active && (
                  <View style={styles.wellbeingScoreCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <EditorScheduleSection
        theme="rose"
        label="Время записи"
        dateTime={dateTime}
        showPicker={showDatePicker}
        onOpenPicker={onOpenDatePicker}
        onPickerChange={onDatePickerChange}
        onClosePicker={onCloseDatePicker}
      />

      <View style={styles.wellbeingActions}>
        <TouchableOpacity
          style={styles.wellbeingCancelBtn}
          onPress={onCancel}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="close-outline" size={18} color="#BE123C" />
          <Text style={styles.wellbeingCancelText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.wellbeingSaveBtn}
          onPress={onSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.wellbeingSaveText}>Сохранить оценку</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const SYMPTOM_SEVERITY_OPTIONS = [
  { title: 'Слабо', value: 2, hint: 'лёгкое' },
  { title: 'Умеренно', value: 5, hint: 'заметное' },
  { title: 'Сильно', value: 8, hint: 'выраженное' },
] as const;

function SymptomInlineEditor({
  editorId,
  name,
  severity,
  dateTimeStart,
  dateTimeEnd,
  suggestions,
  saving,
  showStartPicker,
  showEndPicker,
  onChangeName,
  onSelectSeverity,
  onOpenStartPicker,
  onOpenEndPicker,
  onStartPickerChange,
  onEndPickerChange,
  onCloseStartPicker,
  onCloseEndPicker,
  onCancel,
  onSave,
}: {
  editorId: EntityId | null;
  name: string;
  severity: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  suggestions: string[];
  saving: boolean;
  showStartPicker: boolean;
  showEndPicker: boolean;
  onChangeName: (value: string) => void;
  onSelectSeverity: (value: string) => void;
  onOpenStartPicker: () => void;
  onOpenEndPicker: () => void;
  onStartPickerChange: (event: { type?: string }, date?: Date) => void;
  onEndPickerChange: (event: { type?: string }, date?: Date) => void;
  onCloseStartPicker: () => void;
  onCloseEndPicker: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const severityValue = Number(severity || '5');
  const selectedSeverity =
    SYMPTOM_SEVERITY_OPTIONS.find((item) => item.value === severityValue) ??
    SYMPTOM_SEVERITY_OPTIONS[1];

  return (
    <View style={styles.symptomEditor}>
      <View style={styles.symptomHero}>
        <View style={styles.symptomHeroGlow} />
        <View style={styles.symptomHeroRow}>
          <View style={styles.symptomHeroIconWrap}>
            <Ionicons name="pulse" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.symptomHeroText}>
            <Text style={styles.symptomHeroTitle}>
              {editorId != null ? 'Редактирование' : 'Новый симптом'}
            </Text>
            <Text style={styles.symptomHeroSubtitle}>
              {name.trim() || 'Укажите название и интенсивность'}
            </Text>
          </View>
          <View style={styles.symptomHeroPill}>
            <Text style={styles.symptomHeroPillValue} numberOfLines={1}>
              {selectedSeverity.title}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.symptomSection}>
        <Text style={styles.symptomSectionTitle}>Симптом</Text>
        <View style={styles.symptomFieldShell}>
          <View style={styles.symptomFieldIcon}>
            <Ionicons name="search-outline" size={18} color="#1D4ED8" />
          </View>
          <TextInput
            style={styles.symptomFieldInput}
            value={name}
            onChangeText={onChangeName}
            placeholder="Начните вводить название..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {!!name.trim() && suggestions.length > 0 && (
          <View style={styles.symptomSuggestPanel}>
            <Text style={styles.symptomSuggestTitle}>Частые симптомы</Text>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.symptomSuggestRow}
                activeOpacity={0.85}
                onPress={() => onChangeName(item)}
              >
                <View style={styles.symptomSuggestIcon}>
                  <Ionicons name="medical-outline" size={16} color="#1D4ED8" />
                </View>
                <Text style={styles.symptomSuggestText}>{item}</Text>
                <Ionicons name="chevron-forward" size={16} color="#93C5FD" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.symptomSection}>
        <Text style={styles.symptomSectionTitle}>Интенсивность</Text>
        <View style={styles.symptomSeverityHero}>
          <View style={styles.symptomSeverityHeroLeft}>
            <Text style={styles.symptomSeverityHeroLabel}>Уровень</Text>
            <Text style={styles.symptomSeverityHeroValue}>{selectedSeverity.title}</Text>
            <Text style={styles.symptomSeverityHeroHint}>
              {selectedSeverity.hint} · {severityValue}/10
            </Text>
          </View>
          <View style={styles.symptomSeverityHeroRing}>
            <Ionicons name="pulse" size={22} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.symptomSeverityGrid}>
          {SYMPTOM_SEVERITY_OPTIONS.map((item) => {
            const active = severityValue === item.value;
            return (
              <TouchableOpacity
                key={item.title}
                style={[styles.symptomSeverityCard, active && styles.symptomSeverityCardActive]}
                activeOpacity={0.88}
                onPress={() => onSelectSeverity(String(item.value))}
              >
                <View style={[styles.symptomSeverityCardIcon, active && styles.symptomSeverityCardIconActive]}>
                  <Ionicons
                    name={item.value >= 7 ? 'warning' : item.value >= 4 ? 'alert-circle' : 'checkmark-circle'}
                    size={18}
                    color={active ? '#FFFFFF' : '#1D4ED8'}
                  />
                </View>
                <Text style={[styles.symptomSeverityCardTitle, active && styles.symptomSeverityCardTitleActive]}>
                  {item.title}
                </Text>
                <Text style={[styles.symptomSeverityCardHint, active && styles.symptomSeverityCardHintActive]}>
                  {item.hint}
                </Text>
                {active && (
                  <View style={styles.symptomSeverityCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <EditorScheduleSection
        theme="blue"
        label="Начало симптома"
        dateTime={dateTimeStart}
        showPicker={showStartPicker}
        onOpenPicker={onOpenStartPicker}
        onPickerChange={onStartPickerChange}
        onClosePicker={onCloseStartPicker}
      />

      <EditorScheduleSection
        theme="blue"
        label="Окончание (необязательно)"
        dateTime={dateTimeEnd}
        showPicker={showEndPicker}
        optional
        onOpenPicker={onOpenEndPicker}
        onPickerChange={onEndPickerChange}
        onClosePicker={onCloseEndPicker}
      />

      <View style={styles.symptomActions}>
        <TouchableOpacity
          style={styles.symptomCancelBtn}
          onPress={onCancel}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="close-outline" size={18} color="#1D4ED8" />
          <Text style={styles.symptomCancelText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.symptomSaveBtn}
          onPress={onSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.symptomSaveText}>Сохранить симптом</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MedicineInlineEditor({
  editorId,
  name,
  dosage,
  unit,
  dateTime,
  suggestions,
  saving,
  showDatePicker,
  onChangeName,
  onChangeDosage,
  onSelectUnit,
  onOpenDatePicker,
  onDatePickerChange,
  onCloseDatePicker,
  onCancel,
  onSave,
}: {
  editorId: EntityId | null;
  name: string;
  dosage: string;
  unit: string;
  dateTime: string;
  suggestions: string[];
  saving: boolean;
  showDatePicker: boolean;
  onChangeName: (value: string) => void;
  onChangeDosage: (value: string) => void;
  onSelectUnit: (value: 'MG' | 'ML' | 'TABLET' | 'DROP') => void;
  onOpenDatePicker: () => void;
  onDatePickerChange: (event: { type?: string }, date?: Date) => void;
  onCloseDatePicker: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const selectedUnit = (unit || 'MG') as 'MG' | 'ML' | 'TABLET' | 'DROP';
  const unitLabel = MEDICINE_UNIT_LABELS[selectedUnit];
  const quickDoses = MEDICINE_QUICK_DOSES[selectedUnit];
  const dosePreview = dosage.trim() ? `${dosage.trim()} ${unitLabel}` : '—';

  return (
    <View style={styles.medicineEditor}>
      <View style={styles.medicineHero}>
        <View style={styles.medicineHeroGlow} />
        <View style={styles.medicineHeroRow}>
          <View style={styles.medicineHeroIconWrap}>
            <Ionicons name="medkit" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.medicineHeroText}>
            <Text style={styles.medicineHeroTitle}>
              {editorId != null ? 'Редактирование' : 'Новый приём'}
            </Text>
            <Text style={styles.medicineHeroSubtitle}>
              {name.trim() || 'Укажите препарат и дозу'}
            </Text>
          </View>
          <View style={styles.medicineHeroPill}>
            <Text style={styles.medicineHeroPillValue}>{dosePreview}</Text>
          </View>
        </View>
      </View>

      <View style={styles.medicineSection}>
        <Text style={styles.medicineSectionTitle}>Препарат</Text>
        <View style={styles.medicineFieldShell}>
          <View style={styles.medicineFieldIcon}>
            <Ionicons name="search-outline" size={18} color="#059669" />
          </View>
          <TextInput
            style={styles.medicineFieldInput}
            value={name}
            onChangeText={onChangeName}
            placeholder="Начните вводить название..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {!!name.trim() && suggestions.length > 0 && (
          <View style={styles.medicineSuggestPanel}>
            <Text style={styles.medicineSuggestTitle}>Популярные варианты</Text>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.medicineSuggestRow}
                activeOpacity={0.85}
                onPress={() => onChangeName(item)}
              >
                <View style={styles.medicineSuggestIcon}>
                  <Ionicons name="medical-outline" size={16} color="#059669" />
                </View>
                <Text style={styles.medicineSuggestText}>{item}</Text>
                <Ionicons name="chevron-forward" size={16} color="#86EFAC" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.medicineSection}>
        <Text style={styles.medicineSectionTitle}>Дозировка</Text>
        <View style={styles.medicineDoseHero}>
          <View style={styles.medicineDoseHeroLeft}>
            <Text style={styles.medicineDoseHeroLabel}>Количество</Text>
            <View style={styles.medicineDoseInputRow}>
              <TextInput
                style={styles.medicineDoseHeroInput}
                value={dosage}
                onChangeText={onChangeDosage}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#A7F3D0"
              />
              <Text style={styles.medicineDoseHeroUnit}>{unitLabel}</Text>
            </View>
          </View>
          <View style={styles.medicineDoseHeroRing}>
            <Ionicons name="pulse-outline" size={22} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.medicineUnitGrid}>
          {(['MG', 'ML', 'TABLET', 'DROP'] as const).map((item) => {
            const active = selectedUnit === item;
            const meta = MEDICINE_UNIT_META[item];
            return (
              <TouchableOpacity
                key={item}
                style={[styles.medicineUnitCard, active && styles.medicineUnitCardActive]}
                activeOpacity={0.88}
                onPress={() => onSelectUnit(item)}
              >
                <View style={[styles.medicineUnitCardIcon, active && styles.medicineUnitCardIconActive]}>
                  <Ionicons
                    name={meta.icon}
                    size={18}
                    color={active ? '#FFFFFF' : '#059669'}
                  />
                </View>
                <Text style={[styles.medicineUnitCardTitle, active && styles.medicineUnitCardTitleActive]}>
                  {meta.title}
                </Text>
                <Text style={[styles.medicineUnitCardHint, active && styles.medicineUnitCardHintActive]}>
                  {meta.hint}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.medicineQuickTitle}>Быстрый выбор</Text>
        <View style={styles.medicineQuickGrid}>
          {quickDoses.map((value) => {
            const active = dosage.trim() === value;
            return (
              <TouchableOpacity
                key={`${selectedUnit}-${value}`}
                style={[styles.medicineQuickCard, active && styles.medicineQuickCardActive]}
                activeOpacity={0.88}
                onPress={() => onChangeDosage(value)}
              >
                <Text style={[styles.medicineQuickValue, active && styles.medicineQuickValueActive]}>
                  {value}
                </Text>
                <Text style={[styles.medicineQuickUnit, active && styles.medicineQuickUnitActive]}>
                  {unitLabel}
                </Text>
                {active && (
                  <View style={styles.medicineQuickCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <EditorScheduleSection
        theme="green"
        label="Когда приняли"
        dateTime={dateTime}
        showPicker={showDatePicker}
        onOpenPicker={onOpenDatePicker}
        onPickerChange={onDatePickerChange}
        onClosePicker={onCloseDatePicker}
      />

      <View style={styles.medicineActions}>
        <TouchableOpacity
          style={styles.medicineCancelBtn}
          onPress={onCancel}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="close-outline" size={18} color="#047857" />
          <Text style={styles.medicineCancelText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.medicineSaveBtn}
          onPress={onSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.medicineSaveText}>Сохранить приём</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FoodInlineEditor({
  editorId,
  query,
  amount,
  unit,
  dateTime,
  reaction,
  selectedProducts,
  allergens,
  suggestions,
  suggestionsOpen,
  suggestionsLoading,
  saving,
  showDatePicker,
  onChangeQuery,
  onChangeAmount,
  onSelectUnit,
  onToggleReaction,
  onSelectSuggestion,
  onRemoveProduct,
  onOpenDatePicker,
  onDatePickerChange,
  onCloseDatePicker,
  onCancel,
  onSave,
}: {
  editorId: EntityId | null;
  query: string;
  amount: string;
  unit: string;
  dateTime: string;
  reaction: boolean;
  selectedProducts: { foodName: string; category?: string; components?: string[] }[];
  allergens: string[];
  suggestions: { foodName: string; category?: string; components?: string[] }[];
  suggestionsOpen: boolean;
  suggestionsLoading: boolean;
  saving: boolean;
  showDatePicker: boolean;
  onChangeQuery: (value: string) => void;
  onChangeAmount: (value: string) => void;
  onSelectUnit: (value: string) => void;
  onToggleReaction: (value: boolean) => void;
  onSelectSuggestion: (item: { foodName: string; category?: string; components?: string[] }) => void;
  onRemoveProduct: (name: string) => void;
  onOpenDatePicker: () => void;
  onDatePickerChange: (event: { type?: string }, date?: Date) => void;
  onCloseDatePicker: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const selectedUnit = (unit || 'GRAM') as 'GRAM' | 'PORTION' | 'PIECE' | 'MILLILITER';
  const unitLabel = FOOD_UNIT_LABELS[selectedUnit] ?? selectedUnit;
  const quickAmounts = FOOD_QUICK_AMOUNTS[selectedUnit];
  const productLine = selectedProducts.map((item) => item.foodName).join(' + ');
  const preview = query.trim() || productLine || 'Что вы ели?';
  const amountPreview = amount.trim() ? `${amount.trim()} ${unitLabel}` : '—';
  const showSuggestions = suggestionsOpen && query.trim().length > 0 && suggestions.length > 0;

  return (
    <View style={styles.foodEditor}>
      <View style={styles.foodHero}>
        <View style={styles.foodHeroGlow} />
        <View style={styles.foodHeroRow}>
          <View style={styles.foodHeroIconWrap}>
            <Ionicons name="restaurant" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.foodHeroText}>
            <Text style={styles.foodHeroTitle}>
              {editorId != null ? 'Редактирование' : 'Новый приём пищи'}
            </Text>
            <Text style={styles.foodHeroSubtitle} numberOfLines={2}>
              {preview}
            </Text>
          </View>
          <View style={styles.foodHeroPill}>
            <Text style={styles.foodHeroPillValue}>{amountPreview}</Text>
          </View>
        </View>
      </View>

      <View style={styles.foodSection}>
        <Text style={styles.foodSectionTitle}>Что съели</Text>
        <View style={styles.foodFieldShell}>
          <View style={styles.foodFieldIcon}>
            <Ionicons name="search-outline" size={18} color="#1D4ED8" />
          </View>
          <TextInput
            style={styles.foodFieldInput}
            value={query}
            onChangeText={onChangeQuery}
            placeholder="Начните вводить название..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        {showSuggestions && (
          <View style={styles.foodSuggestPanel}>
            <Text style={styles.foodSuggestTitle}>Подсказки</Text>
            {suggestions.slice(0, 6).map((item) => (
              <TouchableOpacity
                key={item.foodName}
                style={styles.foodSuggestRow}
                activeOpacity={0.85}
                onPress={() => onSelectSuggestion(item)}
              >
                <View style={styles.foodSuggestIcon}>
                  <Ionicons name="restaurant-outline" size={16} color="#1D4ED8" />
                </View>
                <Text style={styles.foodSuggestText} numberOfLines={1}>
                  {item.foodName}
                </Text>
                <Ionicons name="add-circle" size={18} color="#93C5FD" />
              </TouchableOpacity>
            ))}
            {suggestionsLoading && <ActivityIndicator size="small" color="#1D4ED8" />}
          </View>
        )}

        {!!selectedProducts.length && (
          <View style={styles.foodSelectedWrap}>
            {selectedProducts.map((item) => (
              <View key={item.foodName} style={styles.foodSelectedChip}>
                <Text style={styles.foodSelectedChipText} numberOfLines={1}>
                  {item.foodName}
                </Text>
                <TouchableOpacity onPress={() => onRemoveProduct(item.foodName)} hitSlop={8}>
                  <Ionicons name="close" size={14} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {!!allergens.length && (
          <View style={styles.foodAllergenPanel}>
            <Text style={styles.foodAllergenPanelTitle}>Аллергены и компоненты</Text>
            <View style={styles.foodAllergenChipsWrap}>
              {allergens.map((item) => (
                <View key={item} style={styles.foodAllergenChip}>
                  <Ionicons name="flask-outline" size={12} color="#1D4ED8" />
                  <Text style={styles.foodAllergenChipText} numberOfLines={1}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.foodSection}>
        <Text style={styles.foodSectionTitle}>Количество</Text>
        <View style={styles.foodDoseHero}>
          <View style={styles.foodDoseHeroLeft}>
            <Text style={styles.foodDoseHeroLabel}>Порция</Text>
            <View style={styles.foodDoseInputRow}>
              <TextInput
                style={styles.foodDoseHeroInput}
                value={amount}
                onChangeText={onChangeAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#93C5FD"
              />
              <Text style={styles.foodDoseHeroUnit}>{unitLabel}</Text>
            </View>
          </View>
          <View style={styles.foodDoseHeroRing}>
            <Ionicons name="nutrition-outline" size={22} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.foodUnitGrid}>
          {(['GRAM', 'PORTION', 'PIECE', 'MILLILITER'] as const).map((item) => {
            const active = selectedUnit === item;
            const meta = FOOD_UNIT_META[item];
            return (
              <TouchableOpacity
                key={item}
                style={[styles.foodUnitCard, active && styles.foodUnitCardActive]}
                activeOpacity={0.88}
                onPress={() => onSelectUnit(item)}
              >
                <View style={[styles.foodUnitCardIcon, active && styles.foodUnitCardIconActive]}>
                  <Ionicons name={meta.icon} size={18} color={active ? '#FFFFFF' : '#1D4ED8'} />
                </View>
                <Text style={[styles.foodUnitCardTitle, active && styles.foodUnitCardTitleActive]}>
                  {meta.title}
                </Text>
                <Text style={[styles.foodUnitCardHint, active && styles.foodUnitCardHintActive]}>
                  {meta.hint}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.foodQuickTitle}>Быстрый выбор</Text>
        <View style={styles.foodQuickGrid}>
          {quickAmounts.map((value) => {
            const active = amount.trim() === value;
            return (
              <TouchableOpacity
                key={`${selectedUnit}-${value}`}
                style={[styles.foodQuickCard, active && styles.foodQuickCardActive]}
                activeOpacity={0.88}
                onPress={() => onChangeAmount(value)}
              >
                <Text style={[styles.foodQuickValue, active && styles.foodQuickValueActive]}>
                  {value}
                </Text>
                <Text style={[styles.foodQuickUnit, active && styles.foodQuickUnitActive]}>
                  {unitLabel}
                </Text>
                {active && (
                  <View style={styles.foodQuickCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.foodSection}>
        <Text style={styles.foodSectionTitle}>Реакция</Text>
        <View style={styles.foodReactionGrid}>
          <TouchableOpacity
            style={[styles.foodReactionCard, !reaction && styles.foodReactionCardActive]}
            activeOpacity={0.88}
            onPress={() => onToggleReaction(false)}
          >
            <View style={[styles.foodReactionCardIcon, !reaction && styles.foodReactionCardIconActive]}>
              <Ionicons name="checkmark-circle" size={18} color={!reaction ? '#FFFFFF' : '#1D4ED8'} />
            </View>
            <Text style={[styles.foodReactionCardTitle, !reaction && styles.foodReactionCardTitleActive]}>
              Не было
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.foodReactionCard, reaction && styles.foodReactionCardDanger]}
            activeOpacity={0.88}
            onPress={() => onToggleReaction(true)}
          >
            <View style={[styles.foodReactionCardIcon, reaction && styles.foodReactionCardIconDanger]}>
              <Ionicons name="alert-circle" size={18} color={reaction ? '#FFFFFF' : '#DC2626'} />
            </View>
            <Text style={[styles.foodReactionCardTitle, reaction && styles.foodReactionCardTitleDanger]}>
              Была реакция
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <EditorScheduleSection
        theme="blue"
        label="Когда ели"
        dateTime={dateTime}
        showPicker={showDatePicker}
        onOpenPicker={onOpenDatePicker}
        onPickerChange={onDatePickerChange}
        onClosePicker={onCloseDatePicker}
      />

      <View style={styles.foodActions}>
        <TouchableOpacity
          style={styles.foodCancelBtn}
          onPress={onCancel}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="close-outline" size={18} color="#1D4ED8" />
          <Text style={styles.foodCancelText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.foodSaveBtn}
          onPress={onSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.foodSaveText}>Сохранить приём</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NoteInlineEditor({
  editorId,
  text,
  dateTime,
  saving,
  showDatePicker,
  onChangeText,
  onOpenDatePicker,
  onDatePickerChange,
  onCloseDatePicker,
  onCancel,
  onSave,
}: {
  editorId: EntityId | null;
  text: string;
  dateTime: string;
  saving: boolean;
  showDatePicker: boolean;
  onChangeText: (value: string) => void;
  onOpenDatePicker: () => void;
  onDatePickerChange: (event: { type?: string }, date?: Date) => void;
  onCloseDatePicker: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const preview = text.trim() ? text.trim().slice(0, 48) : 'Ваша заметка за день';
  const charCount = text.trim().length;

  return (
    <View style={styles.noteEditor}>
      <View style={styles.noteHero}>
        <View style={styles.noteHeroGlow} />
        <View style={styles.noteHeroRow}>
          <View style={styles.noteHeroIconWrap}>
            <Ionicons name="document-text" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.noteHeroText}>
            <Text style={styles.noteHeroTitle}>
              {editorId != null ? 'Редактирование' : 'Новая заметка'}
            </Text>
            <Text style={styles.noteHeroSubtitle} numberOfLines={2}>
              {preview}
            </Text>
          </View>
          <View style={styles.noteHeroPill}>
            <Text style={styles.noteHeroPillValue}>{charCount}</Text>
            <Text style={styles.noteHeroPillSub}>симв.</Text>
          </View>
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteSectionTitle}>Шаблоны</Text>
        <View style={styles.noteQuickGrid}>
          {NOTE_TEMPLATES.map((item) => {
            const active = text.trim() === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.noteQuickCard, active && styles.noteQuickCardActive]}
                activeOpacity={0.88}
                onPress={() => onChangeText(item)}
              >
                <View style={[styles.noteQuickCardIcon, active && styles.noteQuickCardIconActive]}>
                  <Ionicons
                    name="document-text-outline"
                    size={16}
                    color={active ? '#FFFFFF' : '#D97706'}
                  />
                </View>
                <Text style={[styles.noteQuickCardText, active && styles.noteQuickCardTextActive]} numberOfLines={2}>
                  {item}
                </Text>
                {active && (
                  <View style={styles.noteQuickCheck}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteSectionTitle}>Метки</Text>
        <View style={styles.noteTagGrid}>
          {NOTE_TAGS.map((tag) => {
            const active = text.includes(`#${tag}`);
            return (
              <TouchableOpacity
                key={tag}
                style={[styles.noteTagCard, active && styles.noteTagCardActive]}
                activeOpacity={0.88}
                onPress={() => onChangeText(text ? `${text}\n#${tag}` : `#${tag}`)}
              >
                <Text style={[styles.noteTagCardText, active && styles.noteTagCardTextActive]}>
                  #{tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteSectionTitle}>Текст заметки</Text>
        <View style={styles.noteFieldShell}>
          <View style={styles.noteFieldIcon}>
            <Ionicons name="create-outline" size={18} color="#D97706" />
          </View>
          <TextInput
            style={styles.noteFieldInput}
            value={text}
            onChangeText={onChangeText}
            placeholder="Опишите, что произошло..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>

      <EditorScheduleSection
        theme="amber"
        label="Дата и время"
        dateTime={dateTime}
        showPicker={showDatePicker}
        onOpenPicker={onOpenDatePicker}
        onPickerChange={onDatePickerChange}
        onClosePicker={onCloseDatePicker}
      />

      <View style={styles.noteActions}>
        <TouchableOpacity
          style={styles.noteCancelBtn}
          onPress={onCancel}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Ionicons name="close-outline" size={18} color="#B45309" />
          <Text style={styles.noteCancelText}>Отмена</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.noteSaveBtn}
          onPress={onSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.noteSaveText}>Сохранить заметку</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SectionBlock({
  title,
  count,
  icon,
  accentColor,
  onAddPress,
  children,
}: {
  title: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  onAddPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={22} color={accentColor} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        <View style={styles.sectionRight}>
          <Text style={[styles.countBadgeText, { color: accentColor }]}>{count}</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={onAddPress} style={styles.addButton}>
            <Ionicons name="add" size={24} color={accentColor} />
          </TouchableOpacity>
        </View>
      </View>

      {children}
    </View>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyCardText}>{text}</Text>
    </View>
  );
}

function EntryCard({
  title,
  subtitle,
  accentColor,
  icon,
  badge,
  badgeEmoji,
  children,
  onEdit,
  onDelete,
  deleting,
}: {
  title: string;
  subtitle?: string;
  accentColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
  badgeEmoji?: string;
  children?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <View style={styles.entryCard}>
      <View style={[styles.entryAccentStripe, { backgroundColor: accentColor }]} />
      <View style={styles.entryMain}>
        <View style={styles.entryTop}>
          <View style={[styles.entryIconWrap, { backgroundColor: withAlpha(accentColor, 0.1) }]}>
            <Ionicons name={icon} size={18} color={accentColor} />
          </View>

          <View style={styles.entryTextBlock}>
            <Text style={styles.entryTitle} numberOfLines={2}>
              {title}
            </Text>
            {!!subtitle && (
              <View style={styles.entryTimeRow}>
                <Ionicons name="time-outline" size={12} color="#94A3B8" />
                <Text style={styles.entrySubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            )}
          </View>

          {!!(badge || badgeEmoji) && (
            <View style={[styles.entryBadge, { backgroundColor: withAlpha(accentColor, 0.1) }]}>
              {!!badgeEmoji && <Text style={styles.entryBadgeEmoji}>{badgeEmoji}</Text>}
              {!!badge && (
                <Text style={[styles.entryBadgeText, { color: accentColor }]}>{badge}</Text>
              )}
            </View>
          )}

          <View style={styles.entryActions}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: withAlpha(accentColor, 0.08) }]}
              onPress={onEdit}
              activeOpacity={0.85}
              disabled={deleting}
            >
              <Ionicons name="create-outline" size={16} color={accentColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: withAlpha(accentColor, 0.08) }]}
              onPress={onDelete}
              activeOpacity={0.85}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={accentColor} />
              ) : (
                <Ionicons name="trash-outline" size={16} color={accentColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {!!children && <View style={styles.entryBody}>{children}</View>}
      </View>
    </View>
  );
}

function MetaChip({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string;
  accentColor: string;
}) {
  return (
    <View style={[styles.metaChip, { backgroundColor: withAlpha(accentColor, 0.06) }]}>
      <Text style={styles.metaChipLabel}>{label}</Text>
      <Text style={[styles.metaChipValue, { color: accentColor }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function FoodEntryCard({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: Food;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  const [compositionExpanded, setCompositionExpanded] = useState(false);
  const accentColor = SECTION_COLORS.food;
  const categoryLabel =
    (FOOD_CATEGORY_LABELS[item.category ?? ''] ?? item.category) || '—';
  const hasReaction = !!item.reactionOccurred;
  const composition = item.components?.length ? item.components.join(', ') : '';
  const amountBadge =
    item.amount != null
      ? `${item.amount} ${FOOD_UNIT_LABELS[item.unit ?? ''] ?? item.unit ?? ''}`.trim()
      : undefined;
  const canExpandComposition = composition.length > 42;

  return (
    <View style={styles.entryCard}>
      <View style={[styles.entryAccentStripe, { backgroundColor: accentColor }]} />
      <View style={styles.entryMain}>
        <View style={styles.entryTop}>
          <View style={[styles.entryIconWrap, { backgroundColor: withAlpha(accentColor, 0.1) }]}>
            <Ionicons name="restaurant-outline" size={18} color={accentColor} />
          </View>

          <View style={styles.entryTextBlock}>
            <Text style={styles.entryTitle} numberOfLines={2}>
              {item.foodName}
            </Text>
            <View style={styles.entryTimeRow}>
              <Ionicons name="time-outline" size={12} color="#94A3B8" />
              <Text style={styles.entrySubtitle} numberOfLines={1}>
                {formatDate(item.intakeTime)}
              </Text>
            </View>
          </View>

          {!!amountBadge && (
            <View style={[styles.entryBadge, { backgroundColor: withAlpha(accentColor, 0.1) }]}>
              <Text style={[styles.entryBadgeText, { color: accentColor }]}>{amountBadge}</Text>
            </View>
          )}

          <View style={styles.entryActions}>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: withAlpha(accentColor, 0.08) }]}
              onPress={onEdit}
              activeOpacity={0.85}
              disabled={deleting}
            >
              <Ionicons name="create-outline" size={16} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: withAlpha(accentColor, 0.08) }]}
              onPress={onDelete}
              activeOpacity={0.85}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={accentColor} />
              ) : (
                <Ionicons name="trash-outline" size={16} color={accentColor} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.foodMetaRow}>
          <View style={[styles.foodMetaTag, { backgroundColor: withAlpha(accentColor, 0.08) }]}>
            <Text style={[styles.foodMetaTagText, { color: accentColor }]} numberOfLines={1}>
              {categoryLabel}
            </Text>
          </View>
          <View
            style={[
              styles.foodMetaTag,
              {
                backgroundColor: hasReaction
                  ? withAlpha(COLORS.danger, 0.1)
                  : withAlpha(accentColor, 0.06),
              },
            ]}
          >
            <Ionicons
              name={hasReaction ? 'alert-circle' : 'checkmark-circle-outline'}
              size={13}
              color={hasReaction ? COLORS.danger : '#64748B'}
            />
            <Text
              style={[
                styles.foodMetaTagText,
                { color: hasReaction ? COLORS.danger : '#64748B' },
              ]}
            >
              {hasReaction ? 'Реакция' : 'Нет'}
            </Text>
          </View>
        </View>

        {!!composition && (
          <TouchableOpacity
            style={styles.foodCompositionRow}
            onPress={() => {
              if (canExpandComposition) {
                setCompositionExpanded((value) => !value);
              }
            }}
            activeOpacity={canExpandComposition ? 0.85 : 1}
            disabled={!canExpandComposition}
          >
            <Text
              style={styles.foodCompositionText}
              numberOfLines={compositionExpanded ? undefined : 1}
            >
              {composition}
            </Text>
            {canExpandComposition && (
              <Ionicons
                name={compositionExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#94A3B8"
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function getWellbeingVisual(score: number) {
  const normalized = toFiveScale(score);
  const option = WELLBEING_OPTIONS.find((item) => item.score === normalized);
  return {
    emoji: option?.emoji ?? '😐',
    label: option?.label ?? `${normalized}/5`,
    short: `${normalized}/5`,
  };
}

export default function DiaryScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [commonFeelings, setCommonFeelings] = useState<CommonFeeling[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editorType, setEditorType] = useState<EditorType | null>(null);
  const [editorId, setEditorId] = useState<EntityId | null>(null);
  const [editorSaving, setEditorSaving] = useState(false);
  const [fName, setFName] = useState('');
  const [fNumber, setFNumber] = useState('');
  const [fUnit, setFUnit] = useState('');
  const [fText, setFText] = useState('');
  const [fText2, setFText2] = useState('');
  const [fDateTime, setFDateTime] = useState('');
  const [fDateTimeEnd, setFDateTimeEnd] = useState('');
  const [fToggle, setFToggle] = useState(false);
  const [showSymptomStartPicker, setShowSymptomStartPicker] = useState(false);
  const [showSymptomEndPicker, setShowSymptomEndPicker] = useState(false);
  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  const [symptomCatalog, setSymptomCatalog] = useState<string[]>([]);
  const [medicineCatalog, setMedicineCatalog] = useState<string[]>([]);
  const [foodSearch, setFoodSearch] = useState('');
  const [foodSuggestions, setFoodSuggestions] = useState<
    { foodName: string; category?: string; components?: string[] }[]
  >([]);
  const [foodSuggestionsOpen, setFoodSuggestionsOpen] = useState(false);
  const [foodSuggestionsLoading, setFoodSuggestionsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    { foodName: string; category?: string; components?: string[] }[]
  >([]);
  const [foodComponents, setFoodComponents] = useState<string[]>([]);
  const [componentInput, setComponentInput] = useState('');
  const [commonComments, setCommonComments] = useState<Record<string, string>>({});

  const todayDateKey = toAppDayKey(new Date());
  const selectedDateKey = useMemo(() => toAppDayKey(selectedDate), [selectedDate]);
  const canGoNextDate = selectedDateKey < todayDateKey;
  const defaultSelectedDateTime = useMemo(
    () => `${selectedDateKey}T12:00:00`,
    [selectedDateKey]
  );

  const shiftDay = useCallback((delta: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      next.setHours(0, 0, 0, 0);
      if (delta > 0 && toAppDayKey(next) > toAppDayKey(new Date())) {
        return prev;
      }
      return next;
    });
  }, []);

  const loadDiary = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const results = await Promise.allSettled([
          getUserProfileApi(),
          getCommonFeelingsByDateApi(selectedDateKey),
          getSymptomsByDateApi(selectedDateKey),
          getMedicinesByDateApi(selectedDateKey),
          getFoodByDateApi(selectedDateKey),
          getNotesByDateApi(selectedDateKey),
        ]);

      const [profileResult, commonResult, symptomResult, medicineResult, foodResult, noteResult] =
        results;

      setProfile(profileResult.status === 'fulfilled' ? profileResult.value ?? null : null);

      setCommonFeelings(
        commonResult.status === 'fulfilled' ? commonResult.value ?? [] : [],
      );
      setSymptoms(symptomResult.status === 'fulfilled' ? symptomResult.value ?? [] : []);
      setMedicines(medicineResult.status === 'fulfilled' ? medicineResult.value ?? [] : []);
      setFoods(foodResult.status === 'fulfilled' ? foodResult.value ?? [] : []);
      setNotes(noteResult.status === 'fulfilled' ? noteResult.value ?? [] : []);

      if (commonResult.status === 'fulfilled') {
        setCommonComments((prev) => {
          const next = { ...prev };
          const commonItems = commonResult.value ?? [];
          commonItems.forEach((item) => {
            const key = String(item.feelingId);
            if (item.comment && item.comment.trim()) {
              next[key] = item.comment;
            }
          });
          return next;
        });
      }

      const failed = results.filter((item) => item.status === 'rejected').length;
      if (failed > 0) {
        Alert.alert('Внимание', 'Часть записей не загрузилась, показываем доступные данные.');
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить дневник');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDateKey]);

  useEffect(() => {
    void loadDiary();
  }, [loadDiary]);

  useFocusEffect(
    useCallback(() => {
      void loadDiary(true);
    }, [loadDiary]),
  );

  useEffect(() => {
    if (editorType == null || editorId != null) return;
    setFDateTime(defaultSelectedDateTime);
  }, [selectedDateKey, defaultSelectedDateTime, editorType, editorId]);

  useEffect(() => {
    void getSymptomsCatalogApi()
      .then((list) =>
        setSymptomCatalog(
          Array.from(
            new Set([
              ...DEFAULT_SYMPTOMS,
              ...(list ?? []).map((item) => item.symptomName).filter(Boolean),
            ])
          )
        )
      )
      .catch(() => setSymptomCatalog(DEFAULT_SYMPTOMS));

    void getMedicinesCatalogApi()
      .then((list) =>
        setMedicineCatalog(
          Array.from(
            new Set([
              ...DEFAULT_MEDICINES,
              ...(list ?? []).map((item: any) => item.medicineName).filter(Boolean),
            ])
          )
        )
      )
      .catch(() => setMedicineCatalog(DEFAULT_MEDICINES));
  }, []);

  useEffect(() => {
    if (editorType !== 'food') return;
    const query = foodSearch.trim();
    if (!query) {
      setFoodSuggestions(TOP_FOOD_CATALOG.slice(0, 60));
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setFoodSuggestionsLoading(true);
      try {
        const [apiItems, localItems] = await Promise.all([
          searchFoodCatalogApi(query).catch(() => []),
          Promise.resolve(
            TOP_FOOD_CATALOG.filter((item) =>
              item.foodName.toLowerCase().includes(query.toLowerCase())
            )
          ),
        ]);

        const merged = [...apiItems, ...localItems];
        const deduped = Array.from(
          new Map(merged.map((item) => [item.foodName.toLowerCase(), item])).values()
        ).slice(0, 60);
        if (!cancelled) setFoodSuggestions(deduped);
      } finally {
        if (!cancelled) setFoodSuggestionsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [editorType, foodSearch]);

  const filteredCommonFeelings = useMemo(
    () => commonFeelings.filter((item) => isInSelectedDate(item.dateTime, selectedDateKey)),
    [commonFeelings, selectedDateKey]
  );

  const filteredSymptoms = useMemo(
    () =>
      symptoms.filter((item) =>
        isInSelectedDate(item.startTime || item.createdAt || '', selectedDateKey)
      ),
    [symptoms, selectedDateKey]
  );

  const filteredMedicines = useMemo(
    () =>
      medicines.filter((item) =>
        isInSelectedDate(item.intakeTime || item.intakeDate || '', selectedDateKey)
      ),
    [medicines, selectedDateKey]
  );

  const filteredFoods = useMemo(
    () => foods.filter((item) => isInSelectedDate(item.intakeTime, selectedDateKey)),
    [foods, selectedDateKey]
  );

  const filteredNotes = useMemo(
    () => notes.filter((item) => isInSelectedDate(item.date, selectedDateKey)),
    [notes, selectedDateKey]
  );

  const totalCount =
    filteredCommonFeelings.length +
    filteredSymptoms.length +
    filteredMedicines.length +
    filteredFoods.length +
    filteredNotes.length;

  const executeDelete = useCallback(
    async (id: string, onDelete: () => Promise<void>) => {
            try {
              setDeletingId(id);
              await onDelete();
              await loadDiary(true);
            } catch (error) {
              Alert.alert(
                'Ошибка',
                error instanceof Error ? error.message : 'Не удалось удалить запись'
              );
            } finally {
              setDeletingId(null);
            }
    },
    [loadDiary]
  );

  const confirmDelete = useCallback(
    (id: string, title: string, onDelete: () => Promise<void>) => {
      if (Platform.OS === 'web' && typeof globalThis.confirm === 'function') {
        const ok = globalThis.confirm(`Удалить запись "${title}"?`);
        if (ok) {
          void executeDelete(id, onDelete);
        }
        return;
      }

      Alert.alert('Удаление', `Удалить запись "${title}"?`, [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            void executeDelete(id, onDelete);
          },
        },
      ]);
    },
    [executeDelete]
  );

  const normalizeCategory = useCallback((value?: string) => {
    const normalized = (value ?? '').toUpperCase();
    const allowed = new Set([
      'FRUIT',
      'VEGETABLE',
      'MEAT',
      'FISH',
      'DAIRY',
      'GRAINS',
      'NUTS',
      'LEGUMES',
      'FAST_FOOD',
      'BEVERAGES',
      'SWEETS',
      'GARNISH',
      'SOUP',
      'OTHER',
    ]);
    return allowed.has(normalized) ? normalized : 'OTHER';
  }, []);

  const mergeUnique = useCallback((items: string[]) => {
    return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
  }, []);

  const closeEditor = useCallback(() => {
    setEditorType(null);
    setEditorId(null);
    setFName('');
    setFNumber('');
    setFUnit('');
    setFText('');
    setFText2('');
    setFDateTime('');
    setFDateTimeEnd('');
    setFToggle(false);
    setShowSymptomStartPicker(false);
    setShowSymptomEndPicker(false);
    setShowEntryDatePicker(false);
    setFoodSearch('');
    setFoodSuggestionsOpen(false);
    setSelectedProducts([]);
    setFoodComponents([]);
    setComponentInput('');
  }, []);

  const openCreateEditor = useCallback((type: EditorType) => {
    setEditorType(type);
    setEditorId(null);
    setFName('');
    setFNumber(type === 'common' ? '3' : type === 'symptom' ? '5' : '');
    setFUnit(type === 'medicine' ? 'MG' : type === 'food' ? 'GRAM' : '');
    setFText('');
    setFText2(type === 'food' ? 'OTHER' : '');
    setFDateTime(defaultSelectedDateTime);
    setFDateTimeEnd('');
    setFToggle(false);
    setShowSymptomStartPicker(false);
    setShowSymptomEndPicker(false);
    setShowEntryDatePicker(false);
    setFoodSearch('');
    setFoodSuggestionsOpen(type === 'food');
    setSelectedProducts([]);
    setFoodComponents([]);
    setComponentInput('');
  }, [defaultSelectedDateTime]);

  const openEditEditor = useCallback(
    (type: EditorType, item: any) => {
      setEditorType(type);
      if (type === 'common') {
        setEditorId(item.feelingId);
        setFNumber(String(toFiveScale(Number(item.wellbeingScore ?? 3))));
        setFDateTime(item.dateTime ?? nowAppDateTimeString());
        return;
      }
      if (type === 'symptom') {
        setEditorId(item.id);
        setFName(item.symptomName ?? '');
        const severity = Number(item.severity ?? 5);
        const snapped = severity >= 7 ? 8 : severity >= 4 ? 5 : 2;
        setFNumber(String(snapped));
        setFDateTime(item.startTime || item.createdAt || nowAppDateTimeString());
        setFDateTimeEnd(item.endTime || '');
        return;
      }
      if (type === 'medicine') {
        setEditorId(item.id);
        setFName(item.medicineName ?? '');
        setFNumber(String(item.dosage ?? ''));
        setFUnit(item.unit ?? 'MG');
        setFDateTime(item.intakeTime || item.intakeDate || nowAppDateTimeString());
        return;
      }
      if (type === 'food') {
        setEditorId(item.foodIntakeId);
        setFName(item.foodName ?? '');
        setFNumber(String(item.amount ?? ''));
        setFUnit(item.unit ?? 'GRAM');
        setFText2(item.category ?? 'OTHER');
        setFDateTime(item.intakeTime || nowAppDateTimeString());
        setFToggle(Boolean(item.reactionOccurred));
        setFText(item.reactionDescription ?? '');
        setFoodSearch('');
        setFoodSuggestionsOpen(false);
        setSelectedProducts([]);
        setFoodComponents(item.components ?? []);
        setComponentInput('');
        return;
      }
      setEditorId(item.noteId);
      setFText(item.content ?? '');
      setFDateTime(item.date || nowAppDateTimeString());
    },
    [commonComments]
  );

  const submitEditor = useCallback(async () => {
    if (!editorType) return;
    try {
      setEditorSaving(true);
      if (editorType === 'common') {
        const score = Math.max(1, Math.min(5, Number(fNumber || '3')));
        const dateTime = normalizeDateTimeForStorage(
          fDateTime || defaultSelectedDateTime,
          selectedDateKey,
        );
        if (editorId != null) {
          await updateCommonFeelingApi(editorId, {
            dateTime,
            wellbeingScore: score,
          });
        } else {
          await upsertCommonFeelingApi({
            dateTime,
            wellbeingScore: score,
          });
        }
      } else if (editorType === 'symptom') {
        if (!fName.trim()) throw new Error('Введите название симптома');
        const startTime = normalizeDateTimeForStorage(
          fDateTime || defaultSelectedDateTime,
          selectedDateKey,
        );
        const endTimeRaw = fDateTimeEnd.trim()
          ? normalizeDateTimeForStorage(fDateTimeEnd, selectedDateKey)
          : undefined;
        const safeEndTime =
          endTimeRaw && endTimeRaw >= startTime ? endTimeRaw.slice(0, 19) : undefined;

        const payload = {
          symptomName: fName.trim(),
          severity: Math.max(1, Math.min(10, Number(fNumber || '5'))),
          startTime,
          endTime: safeEndTime,
        };
        if (editorId != null) await updateSymptomApi(editorId, payload);
        else await createSymptomApi(payload);
      } else if (editorType === 'medicine') {
        if (!fName.trim()) throw new Error('Введите название лекарства');
        const payload = {
          medicineName: fName.trim(),
          dosage: Number(fNumber || '0'),
          unit: (fUnit || 'MG') as 'MG' | 'ML' | 'TABLET' | 'DROP',
          intakeDate: normalizeDateTimeForStorage(fDateTime, selectedDateKey),
        };
        if (editorId != null) await updateMedicineApi(editorId, payload);
        else await createMedicineApi(payload);
      } else if (editorType === 'food') {
        const nameFromProducts = selectedProducts.map((item) => item.foodName).join(' + ');
        const name = fName.trim() || nameFromProducts;
        if (!name) throw new Error('Введите название продукта');
        const payload = {
          foodName: name,
          category: normalizeCategory(fText2),
          amount: Number(fNumber || '0'),
          unit: (fUnit || 'GRAM') as 'GRAM' | 'PORTION' | 'PIECE' | 'MILLILITER',
          intakeTime: normalizeDateTimeForStorage(fDateTime, selectedDateKey),
          reactionOccurred: fToggle,
          reactionDescription: '',
          components: mergeUnique(foodComponents),
        };
        if (editorId != null) await updateFoodApi(editorId, payload);
        else await createFoodApi(payload);
      } else if (editorType === 'note') {
        if (!fText.trim()) throw new Error('Введите текст заметки');
        const payload = {
          content: fText.trim(),
          date: normalizeDateTimeForStorage(fDateTime, selectedDateKey),
        };
        if (editorId != null) await updateNoteApi(editorId, payload);
        else await createNoteApi(payload);
      }
      closeEditor();
      await loadDiary(true);
    } catch (error) {
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Не удалось сохранить запись');
    } finally {
      setEditorSaving(false);
    }
  }, [
    closeEditor,
    defaultSelectedDateTime,
    editorId,
    editorType,
    fDateTime,
    fDateTimeEnd,
    fName,
    fNumber,
    fText,
    fText2,
    fToggle,
    fUnit,
    foodComponents,
    loadDiary,
    mergeUnique,
    normalizeCategory,
    selectedDateKey,
    selectedProducts,
  ]);

  const renderInlineEditor = useCallback(
    (type: EditorType) => {
      if (editorType !== type) return null;

      if (type === 'common') {
        return (
          <CommonFeelingInlineEditor
            editorId={editorId}
            score={fNumber}
            dateTime={fDateTime || defaultSelectedDateTime}
            saving={editorSaving}
            showDatePicker={showEntryDatePicker}
            onSelectScore={setFNumber}
            onOpenDatePicker={() => setShowEntryDatePicker(true)}
            onDatePickerChange={(event, selectedDate) => {
              applyNativeDatePick(
                event,
                selectedDate,
                (date) => setFDateTime(toAppDateTimeString(date)),
                () => setShowEntryDatePicker(false),
              );
            }}
            onCloseDatePicker={() => setShowEntryDatePicker(false)}
            onCancel={closeEditor}
            onSave={() => void submitEditor()}
          />
        );
      }

      if (type === 'symptom') {
        const symptomFiltered = symptomCatalog
          .filter((item) => item.toLowerCase().includes(fName.toLowerCase()))
          .slice(0, 12);
        return (
          <SymptomInlineEditor
            editorId={editorId}
            name={fName}
            severity={fNumber}
            dateTimeStart={fDateTime}
            dateTimeEnd={fDateTimeEnd}
            suggestions={symptomFiltered}
            saving={editorSaving}
            showStartPicker={showSymptomStartPicker}
            showEndPicker={showSymptomEndPicker}
            onChangeName={setFName}
            onSelectSeverity={setFNumber}
            onOpenStartPicker={() => {
              setShowSymptomEndPicker(false);
              setShowSymptomStartPicker(true);
            }}
            onOpenEndPicker={() => {
              setShowSymptomStartPicker(false);
              setShowSymptomEndPicker(true);
            }}
            onStartPickerChange={(event, selectedDate) => {
              applyNativeDatePick(
                event,
                selectedDate,
                (date) => setFDateTime(toAppDateTimeString(date)),
                () => setShowSymptomStartPicker(false),
              );
            }}
            onEndPickerChange={(event, selectedDate) => {
              if (!selectedDate) {
                setFDateTimeEnd('');
                return;
              }
              applyNativeDatePick(
                event,
                selectedDate,
                (date) => setFDateTimeEnd(toAppDateTimeString(date)),
                () => setShowSymptomEndPicker(false),
              );
            }}
            onCloseStartPicker={() => setShowSymptomStartPicker(false)}
            onCloseEndPicker={() => setShowSymptomEndPicker(false)}
            onCancel={closeEditor}
            onSave={() => void submitEditor()}
          />
        );
      }

      if (type === 'medicine') {
        return (
          <MedicineInlineEditor
            editorId={editorId}
            name={fName}
            dosage={fNumber}
            unit={fUnit}
            dateTime={fDateTime || defaultSelectedDateTime}
            suggestions={medicineCatalog
              .filter((item) => item.toLowerCase().includes(fName.toLowerCase()))
              .slice(0, 12)}
            saving={editorSaving}
            showDatePicker={showEntryDatePicker}
            onChangeName={setFName}
            onChangeDosage={setFNumber}
            onSelectUnit={setFUnit}
            onOpenDatePicker={() => setShowEntryDatePicker(true)}
            onDatePickerChange={(event, selectedDate) => {
              applyNativeDatePick(
                event,
                selectedDate,
                (date) => setFDateTime(toAppDateTimeString(date)),
                () => setShowEntryDatePicker(false),
              );
            }}
            onCloseDatePicker={() => setShowEntryDatePicker(false)}
            onCancel={closeEditor}
            onSave={() => void submitEditor()}
          />
        );
      }

      if (type === 'food') {
        const foodAllergens = mergeUnique([
          ...foodComponents,
          ...selectedProducts.flatMap((p) => p.components ?? []),
        ]);
        return (
          <FoodInlineEditor
            editorId={editorId}
            query={foodSearch}
            amount={fNumber}
            unit={fUnit}
            dateTime={fDateTime || defaultSelectedDateTime}
            reaction={fToggle}
            selectedProducts={selectedProducts}
            allergens={foodAllergens}
            suggestions={foodSuggestions}
            suggestionsOpen={foodSuggestionsOpen}
            suggestionsLoading={foodSuggestionsLoading}
            saving={editorSaving}
            showDatePicker={showEntryDatePicker}
            onChangeQuery={(value) => {
              setFName(value);
              setFoodSearch(value);
              setFoodSuggestionsOpen(true);
            }}
            onChangeAmount={setFNumber}
            onSelectUnit={setFUnit}
            onToggleReaction={setFToggle}
            onSelectSuggestion={(item) => {
              const nextProducts = selectedProducts.some(
                (p) => p.foodName.toLowerCase() === item.foodName.toLowerCase(),
              )
                ? selectedProducts
                : [...selectedProducts, item];
              setSelectedProducts(nextProducts);
              setFoodComponents((prev) => mergeUnique([...prev, ...(item.components ?? [])]));
              setFText2(item.category ?? 'OTHER');
              const autoName = nextProducts.map((p) => p.foodName).join(' + ');
              setFName(autoName);
              setFoodSearch('');
              setFoodSuggestionsOpen(true);
            }}
            onRemoveProduct={(name) => {
              const nextProducts = selectedProducts.filter((p) => p.foodName !== name);
              setSelectedProducts(nextProducts);
              setFName(nextProducts.map((p) => p.foodName).join(' + '));
            }}
            onOpenDatePicker={() => setShowEntryDatePicker(true)}
            onDatePickerChange={(event, selectedDate) => {
              applyNativeDatePick(
                event,
                selectedDate,
                (date) => setFDateTime(toAppDateTimeString(date)),
                () => setShowEntryDatePicker(false),
              );
            }}
            onCloseDatePicker={() => setShowEntryDatePicker(false)}
            onCancel={closeEditor}
            onSave={() => void submitEditor()}
          />
        );
      }

      if (type === 'note') {
        return (
          <NoteInlineEditor
            editorId={editorId}
            text={fText}
            dateTime={fDateTime || defaultSelectedDateTime}
            saving={editorSaving}
            showDatePicker={showEntryDatePicker}
            onChangeText={setFText}
            onOpenDatePicker={() => setShowEntryDatePicker(true)}
            onDatePickerChange={(event, selectedDate) => {
              applyNativeDatePick(
                event,
                selectedDate,
                (date) => setFDateTime(toAppDateTimeString(date)),
                () => setShowEntryDatePicker(false),
              );
            }}
            onCloseDatePicker={() => setShowEntryDatePicker(false)}
            onCancel={closeEditor}
            onSave={() => void submitEditor()}
          />
        );
      }

      return null;
    },
    [
      closeEditor,
      componentInput,
      defaultSelectedDateTime,
      editorId,
      editorSaving,
      editorType,
      fDateTime,
      fDateTimeEnd,
      fName,
      fNumber,
      fText,
      fText2,
      fToggle,
      fUnit,
      foodComponents,
      foodSearch,
      foodSuggestions,
      foodSuggestionsLoading,
      foodSuggestionsOpen,
      medicineCatalog,
      mergeUnique,
      selectedProducts,
      showEntryDatePicker,
      showSymptomEndPicker,
      showSymptomStartPicker,
      symptomCatalog,
      submitEditor,
    ],
  );

  if (loading) {
    return (
      <ScreenSafeArea style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { width: '100%', maxWidth: 860, alignSelf: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadDiary(true);
            }}
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="book" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>{getUserDisplayName(profile)}</Text>
              <Text style={styles.heroSubtitle}>
                Все записи и изменения за день — самочувствие, симптомы, лекарства, питание и заметки.
              </Text>
            </View>
          </View>

          <View style={styles.heroInnerCard}>
            <Text style={styles.heroInnerLabel}>Сводка за день</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Записей</Text>
                <Text style={styles.metricValue}>{totalCount}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Питание</Text>
                <Text style={styles.metricValue}>{filteredFoods.length}</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Симптомы</Text>
                <Text style={styles.metricValue}>{filteredSymptoms.length}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.dayNavWrap}>
          <TouchableOpacity
            style={styles.dayNavButton}
            activeOpacity={0.85}
            onPress={() => shiftDay(-1)}
          >
            <Ionicons name="chevron-back" size={16} color="#1D4ED8" />
            <Text style={styles.dayNavButtonText}>Назад</Text>
          </TouchableOpacity>

          <View style={styles.dayNavCenter}>
            <Text style={styles.dayNavDate}>{formatDayLabel(selectedDate)}</Text>
            <Text style={styles.dayNavHint}>
              {selectedDateKey === todayDateKey ? 'Сегодня' : 'Выбранный день'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.dayNavButton, !canGoNextDate && styles.dayNavButtonDisabled]}
            activeOpacity={0.85}
            onPress={() => {
              if (canGoNextDate) shiftDay(1);
            }}
            disabled={!canGoNextDate}
          >
            <Text
              style={[
                styles.dayNavButtonText,
                !canGoNextDate && styles.dayNavButtonTextDisabled,
              ]}
            >
              Вперед
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={canGoNextDate ? '#1D4ED8' : '#98A2B3'}
            />
          </TouchableOpacity>
        </View>

        <SectionBlock
          title="Самочувствие"
          count={filteredCommonFeelings.length}
          icon="heart-outline"
          accentColor={SECTION_COLORS.common}
          onAddPress={() => openCreateEditor('common')}
        >
          {renderInlineEditor('common')}
          {filteredCommonFeelings.length === 0 ? (
            <EmptySection text="Записей самочувствия пока нет" />
          ) : (
            filteredCommonFeelings.map((item) => {
              const wellbeing = getWellbeingVisual(item.wellbeingScore);
              return (
                <EntryCard
                  key={`common-${item.feelingId}`}
                  icon="heart"
                  title={wellbeing.label}
                  subtitle={formatDate(item.dateTime)}
                  badge={wellbeing.short}
                  badgeEmoji={wellbeing.emoji}
                  accentColor={SECTION_COLORS.common}
                  deleting={deletingId === `common-${item.feelingId}`}
                  onEdit={() => openEditEditor('common', item)}
                  onDelete={() =>
                    confirmDelete(
                      `common-${item.feelingId}`,
                      wellbeing.label,
                      async () => {
                        await deleteCommonFeelingApi(item.feelingId);
                      },
                    )
                  }
                />
              );
            })
          )}
        </SectionBlock>

        <SectionBlock
          title="Симптомы"
          count={filteredSymptoms.length}
          icon="pulse-outline"
          accentColor={SECTION_COLORS.symptom}
          onAddPress={() => openCreateEditor('symptom')}
        >
          {renderInlineEditor('symptom')}
          {filteredSymptoms.length === 0 ? (
            <EmptySection text="Симптомов пока нет" />
          ) : (
            filteredSymptoms.map((item) => (
              <EntryCard
                key={`symptom-${item.id}`}
                icon="pulse-outline"
                title={item.symptomName}
                subtitle={formatDate(item.startTime || item.createdAt || '')}
                badge={toSeverityLabel(item.severity)}
                accentColor={SECTION_COLORS.symptom}
                deleting={deletingId === `symptom-${item.id}`}
                onEdit={() => openEditEditor('symptom', item)}
                onDelete={() =>
                  confirmDelete(`symptom-${item.id}`, item.symptomName, async () => {
                    await deleteSymptomApi(item.id);
                  })
                }
              >
                <MetaChip
                  label="Сила"
                  value={`${toSeverityLabel(item.severity)} · ${item.severity}/10`}
                  accentColor={SECTION_COLORS.symptom}
                />
                {!!item.endTime && (
                  <MetaChip
                    label="Конец"
                    value={formatDate(item.endTime)}
                    accentColor={SECTION_COLORS.symptom}
                  />
                )}
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Лекарства"
          count={filteredMedicines.length}
          icon="medkit-outline"
          accentColor={SECTION_COLORS.medicine}
          onAddPress={() => openCreateEditor('medicine')}
        >
          {renderInlineEditor('medicine')}
          {filteredMedicines.length === 0 ? (
            <EmptySection text="Лекарств пока нет" />
          ) : (
            filteredMedicines.map((item) => (
              <EntryCard
                key={`medicine-${item.id}`}
                icon="medkit-outline"
                title={item.medicineName}
                subtitle={formatDate(item.intakeTime || item.intakeDate || '')}
                badge={
                  item.dosage != null
                    ? `${item.dosage} ${MEDICINE_UNIT_LABELS[item.unit ?? ''] ?? item.unit ?? ''}`.trim()
                    : undefined
                }
                accentColor={SECTION_COLORS.medicine}
                deleting={deletingId === `medicine-${item.id}`}
                onEdit={() => openEditEditor('medicine', item)}
                onDelete={() =>
                  confirmDelete(`medicine-${item.id}`, item.medicineName, async () => {
                    await deleteMedicineApi(item.id);
                  })
                }
              />
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Питание"
          count={filteredFoods.length}
          icon="restaurant-outline"
          accentColor={SECTION_COLORS.food}
          onAddPress={() => openCreateEditor('food')}
        >
          {renderInlineEditor('food')}
          {filteredFoods.length === 0 ? (
            <EmptySection text="Записей о питании пока нет" />
          ) : (
            filteredFoods.map((item) => (
              <FoodEntryCard
                key={`food-${item.foodIntakeId}`}
                item={item}
                deleting={deletingId === `food-${item.foodIntakeId}`}
                onEdit={() => openEditEditor('food', item)}
                onDelete={() =>
                  confirmDelete(`food-${item.foodIntakeId}`, item.foodName, async () => {
                    await deleteFoodApi(item.foodIntakeId);
                  })
                }
              />
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Заметки"
          count={filteredNotes.length}
          icon="document-text-outline"
          accentColor={SECTION_COLORS.note}
          onAddPress={() => openCreateEditor('note')}
        >
          {renderInlineEditor('note')}
          {filteredNotes.length === 0 ? (
            <EmptySection text="Заметок пока нет" />
          ) : (
            filteredNotes.map((item) => (
              <EntryCard
                key={`note-${item.noteId}`}
                icon="document-text-outline"
                title="Заметка"
                subtitle={formatDate(item.date)}
                accentColor={SECTION_COLORS.note}
                deleting={deletingId === `note-${item.noteId}`}
                onEdit={() => openEditEditor('note', item)}
                onDelete={() =>
                  confirmDelete(`note-${item.noteId}`, 'Заметка', async () => {
                    await deleteNoteApi(item.noteId);
                  })
                }
              >
                <View
                  style={[
                    styles.notePreviewBox,
                    {
                      backgroundColor: withAlpha(SECTION_COLORS.note, 0.07),
                      borderColor: withAlpha(SECTION_COLORS.note, 0.15),
                    },
                  ]}
                >
                  <Text style={styles.notePreviewText} numberOfLines={3}>
                    {item.content}
                  </Text>
                </View>
              </EntryCard>
            ))
          )}
        </SectionBlock>

      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF4FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#EEF4FF',
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 120,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroCard: {
    backgroundColor: '#1D4ED8',
    borderRadius: 28,
    padding: 18,
    marginBottom: 4,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF2B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#DDEAF8',
    lineHeight: 20,
  },
  heroInnerCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroInnerLabel: {
    color: '#DDEAF8',
    fontSize: 12,
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#FFFFFF26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF3D',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metricLabel: {
    color: '#DDEAF8',
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  dayNavWrap: {
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayNavCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dayNavDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
  },
  dayNavHint: {
    marginTop: 2,
    fontSize: 12,
    color: '#667085',
  },
  dayNavButton: {
    minWidth: 92,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D7E3F4',
    backgroundColor: '#F8FBFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 10,
  },
  dayNavButtonDisabled: {
    borderColor: '#E4E7EC',
    backgroundColor: '#F9FAFB',
  },
  dayNavButtonText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },
  dayNavButtonTextDisabled: {
    color: '#98A2B3',
  },

  sectionWrap: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    ...Platform.select({
      android: {
        elevation: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#EEF2F6',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    marginRight: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#233142',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 17,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'right',
  },

  emptyCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  emptyCardText: {
    color: '#98A2B3',
    fontSize: 14,
    lineHeight: 20,
  },

  entryCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      android: {
        elevation: 0,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#EEF2F6',
      },
      default: {
        overflow: 'hidden',
        shadowColor: '#0F172A',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  entryAccentStripe: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  entryMain: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  entryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  entryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  entryTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 20,
  },
  entryTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  entrySubtitle: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  entryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  entryBadgeEmoji: {
    fontSize: 14,
  },
  entryBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    ...Platform.select({
      android: {
        paddingTop: 0,
      },
      default: {
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#EEF2F6',
      },
    }),
  },
  metaChip: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: '100%',
    minWidth: '30%',
    flexGrow: 1,
    flexBasis: '45%',
  },
  metaChipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaChipValue: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  foodMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  foodMetaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  foodMetaTagText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  foodCompositionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  foodCompositionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#64748B',
  },
  notePreviewBox: {
    width: '100%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      android: {
        borderWidth: 0,
      },
      default: {
        borderWidth: 1,
      },
    }),
  },
  notePreviewText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  inlineEditorCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E3F4',
    padding: 16,
    gap: 10,
    marginBottom: 12,
  },
  inlineEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 4,
  },
  inlineHint: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  editorSection: {
    gap: 10,
  },
  editorSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  editorFieldShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 4,
    minHeight: 44,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  editorFieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  editorFieldInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  editorSuggestPanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    gap: 4,
  },
  editorSuggestTitle: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  editorSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  editorSuggestIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorSuggestText: {
    flex: 1,
    fontWeight: '700',
    fontSize: 14,
  },
  editorScheduleBlock: {
    gap: 8,
  },
  editorScheduleWebField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editorWebDateInputInline: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 15,
    fontWeight: '600',
    outlineStyle: 'none',
    backgroundColor: 'transparent',
  },
  editorScheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  editorScheduleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorScheduleText: {
    flex: 1,
  },
  editorScheduleDate: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  editorScheduleTime: {
    fontSize: 17,
    fontWeight: '800',
  },
  compactChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compactTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  editorScheduleAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editorScheduleActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editorWebDateInput: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    fontWeight: '600',
    outlineStyle: 'none',
  },
  editorPickerWrap: {
    gap: 8,
    marginTop: 4,
  },
  editorPickerDone: {
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorPickerDoneText: {
    fontSize: 14,
    fontWeight: '800',
  },
  wellbeingEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 12,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#BE123C',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  wellbeingSectionTitle: {
    color: '#9F1239',
  },
  wellbeingHero: {
    backgroundColor: '#BE123C',
    borderRadius: 14,
    padding: 10,
    overflow: 'hidden',
  },
  wellbeingHeroGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FB7185',
    opacity: 0.25,
    top: -40,
    right: -20,
  },
  wellbeingHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wellbeingHeroIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFFFFF2E',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellbeingHeroText: {
    flex: 1,
  },
  wellbeingHeroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  wellbeingHeroSubtitle: {
    fontSize: 12,
    color: '#FFE4E6',
    lineHeight: 16,
  },
  wellbeingHeroPill: {
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF24',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 52,
  },
  wellbeingHeroPillEmoji: {
    fontSize: 18,
  },
  wellbeingHeroPillValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  wellbeingScoreHero: {
    borderRadius: 16,
    backgroundColor: '#E11D48',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wellbeingScoreHeroEmoji: {
    fontSize: 32,
  },
  wellbeingScoreHeroLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  wellbeingScoreGrid: {
    flexDirection: 'row',
    gap: 5,
  },
  wellbeingScoreCard: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
    paddingVertical: 6,
    paddingHorizontal: 2,
    alignItems: 'center',
    position: 'relative',
    minHeight: 52,
    justifyContent: 'center',
  },
  wellbeingScoreCardActive: {
    backgroundColor: '#E11D48',
    borderColor: '#BE123C',
  },
  wellbeingScoreCardEmoji: {
    fontSize: 14,
    marginBottom: 1,
  },
  wellbeingScoreCardNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BE123C',
  },
  wellbeingScoreCardNumberActive: {
    color: '#FFFFFF',
  },
  wellbeingScoreCardLabel: {
    display: 'none',
  },
  wellbeingScoreCardLabelActive: {
    color: '#FFE4E6',
  },
  wellbeingScoreCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#BE123C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wellbeingActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  wellbeingCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  wellbeingCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#BE123C',
  },
  wellbeingSaveBtn: {
    flex: 2,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#BE123C',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  wellbeingSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  symptomEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  symptomSection: { gap: 10 },
  symptomSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  symptomHero: {
    backgroundColor: '#1D4ED8',
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  symptomHeroGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#60A5FA',
    opacity: 0.25,
    top: -40,
    right: -20,
  },
  symptomHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symptomHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF2E',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomHeroText: {
    flex: 1,
  },
  symptomHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  symptomHeroSubtitle: {
    fontSize: 12,
    color: '#DBEAFE',
    lineHeight: 16,
  },
  symptomHeroPill: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF24',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  symptomHeroPillValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  symptomFieldShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    paddingHorizontal: 4,
    minHeight: 52,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  symptomFieldIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  symptomFieldInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  symptomSuggestPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    padding: 8,
    gap: 4,
  },
  symptomSuggestTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    paddingHorizontal: 6,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  symptomSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  symptomSuggestIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomSuggestText: {
    flex: 1,
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 14,
  },
  symptomSeverityHero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#2563EB',
    padding: 14,
    overflow: 'hidden',
  },
  symptomSeverityHeroLeft: { flex: 1 },
  symptomSeverityHeroLabel: {
    fontSize: 12,
    color: '#DBEAFE',
    marginBottom: 4,
    fontWeight: '600',
  },
  symptomSeverityHeroValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  symptomSeverityHeroHint: {
    fontSize: 12,
    color: '#93C5FD',
    marginTop: 2,
    fontWeight: '600',
  },
  symptomSeverityHeroRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF22',
    borderWidth: 2,
    borderColor: '#FFFFFF55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomSeverityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomSeverityCard: {
    width: '31%',
    flexGrow: 1,
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 4,
    position: 'relative',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  symptomSeverityCardActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
    elevation: 3,
  },
  symptomSeverityCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomSeverityCardIconActive: {
    backgroundColor: '#FFFFFF30',
  },
  symptomSeverityCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  symptomSeverityCardTitleActive: {
    color: '#FFFFFF',
  },
  symptomSeverityCardHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  symptomSeverityCardHintActive: {
    color: '#DBEAFE',
  },
  symptomSeverityCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symptomActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  symptomCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  symptomCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  symptomSaveBtn: {
    flex: 2,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  symptomSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  foodEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  foodHero: {
    backgroundColor: '#1D4ED8',
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  foodHeroGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#60A5FA',
    opacity: 0.22,
    top: -40,
    right: -20,
  },
  foodHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  foodHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF2E',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodHeroText: { flex: 1 },
  foodHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  foodHeroSubtitle: {
    fontSize: 12,
    color: '#DBEAFE',
    lineHeight: 16,
  },
  foodHeroPill: {
    maxWidth: 92,
    borderRadius: 999,
    backgroundColor: '#FFFFFF24',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  foodHeroPillValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  foodSection: { gap: 10 },
  foodSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  foodFieldShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    paddingHorizontal: 4,
    minHeight: 52,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  foodFieldIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  foodFieldInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  foodSuggestPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    padding: 8,
    gap: 4,
  },
  foodSuggestTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    paddingHorizontal: 6,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  foodSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  foodSuggestIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodSuggestText: {
    flex: 1,
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 14,
  },
  foodSelectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodSelectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    maxWidth: '100%',
  },
  foodSelectedChipText: {
    color: '#1E40AF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  foodAllergenPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    padding: 10,
    gap: 8,
  },
  foodAllergenPanelTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  foodAllergenChipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  foodAllergenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  foodAllergenChipText: { fontSize: 12, color: '#1E40AF', fontWeight: '700' },
  foodDoseHero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#2563EB',
    padding: 14,
    overflow: 'hidden',
  },
  foodDoseHeroLeft: { flex: 1 },
  foodDoseHeroLabel: {
    fontSize: 12,
    color: '#DBEAFE',
    marginBottom: 6,
    fontWeight: '600',
  },
  foodDoseInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  foodDoseHeroInput: {
    minWidth: 72,
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    padding: 0,
  },
  foodDoseHeroUnit: {
    fontSize: 20,
    fontWeight: '800',
    color: '#93C5FD',
    marginBottom: 6,
  },
  foodDoseHeroRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF22',
    borderWidth: 2,
    borderColor: '#FFFFFF55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodUnitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodUnitCard: {
    width: '48%',
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 4,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  foodUnitCardActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
    shadowOpacity: 0.18,
    elevation: 3,
  },
  foodUnitCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodUnitCardIconActive: { backgroundColor: '#FFFFFF30' },
  foodUnitCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E40AF',
  },
  foodUnitCardTitleActive: { color: '#FFFFFF' },
  foodUnitCardHint: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  foodUnitCardHintActive: { color: '#DBEAFE' },
  foodQuickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 2,
  },
  foodQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodQuickCard: {
    width: '48%',
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  foodQuickCardActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  foodQuickValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E40AF',
  },
  foodQuickValueActive: { color: '#1D4ED8' },
  foodQuickUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
  },
  foodQuickUnitActive: { color: '#2563EB' },
  foodQuickCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodReactionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  foodReactionCard: {
    flex: 1,
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 4,
  },
  foodReactionCardActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1E40AF',
  },
  foodReactionCardDanger: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  foodReactionCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodReactionCardIconActive: { backgroundColor: '#FFFFFF30' },
  foodReactionCardIconDanger: { backgroundColor: '#FFFFFF30' },
  foodReactionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  foodReactionCardTitleActive: { color: '#FFFFFF' },
  foodReactionCardTitleDanger: { color: '#FFFFFF' },
  foodActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  foodCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  foodCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  foodSaveBtn: {
    flex: 2,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  foodSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  noteEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#D97706',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  noteHero: {
    backgroundColor: '#D97706',
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  noteHeroGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FBBF24',
    opacity: 0.22,
    top: -40,
    right: -20,
  },
  noteHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noteHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF2E',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteHeroText: { flex: 1 },
  noteHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  noteHeroSubtitle: {
    fontSize: 12,
    color: '#FEF3C7',
    lineHeight: 16,
  },
  noteHeroPill: {
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: '#FFFFFF24',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 52,
  },
  noteHeroPillValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  noteHeroPillSub: { color: '#FEF3C7', fontSize: 10, fontWeight: '600' },
  noteSection: { gap: 10 },
  noteSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  noteQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteQuickCard: {
    width: '48%',
    minHeight: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    padding: 10,
    gap: 6,
    position: 'relative',
  },
  noteQuickCardActive: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  noteQuickCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteQuickCardIconActive: { backgroundColor: '#FFFFFF30' },
  noteQuickCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 16,
  },
  noteQuickCardTextActive: { color: '#FFFFFF' },
  noteQuickCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#B45309',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteTagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteTagCard: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
  },
  noteTagCardActive: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  noteTagCardText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  noteTagCardTextActive: { color: '#FFFFFF' },
  noteFieldShell: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 120,
    shadowColor: '#D97706',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  noteFieldIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginTop: 4,
  },
  noteFieldInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#78350F',
    minHeight: 100,
    lineHeight: 22,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  noteCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  noteCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
  },
  noteSaveBtn: {
    flex: 2,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#D97706',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  noteSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  medicineEditor: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    padding: 12,
    marginBottom: 10,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#047857',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  medicineHero: {
    backgroundColor: '#047857',
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
  },
  medicineHeroGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#34D399',
    opacity: 0.22,
    top: -40,
    right: -20,
  },
  medicineHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  medicineHeroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF2E',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineHeroText: {
    flex: 1,
  },
  medicineHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  medicineHeroSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 16,
  },
  medicineHeroPill: {
    maxWidth: 92,
    borderRadius: 999,
    backgroundColor: '#FFFFFF24',
    borderWidth: 1,
    borderColor: '#FFFFFF40',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  medicineHeroPillValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  medicineSection: {
    gap: 10,
  },
  medicineSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  medicineFieldShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FFFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    paddingHorizontal: 4,
    minHeight: 52,
    shadowColor: '#059669',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  medicineFieldIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  medicineFieldInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#064E3B',
  },
  medicineSuggestPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
    padding: 8,
    gap: 4,
  },
  medicineSuggestTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
    paddingHorizontal: 6,
    paddingBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  medicineSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  medicineSuggestIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineSuggestText: {
    flex: 1,
    color: '#065F46',
    fontWeight: '700',
    fontSize: 14,
  },
  medicineDoseHero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#059669',
    padding: 14,
    overflow: 'hidden',
  },
  medicineDoseHeroLeft: {
    flex: 1,
  },
  medicineDoseHeroLabel: {
    fontSize: 12,
    color: '#D1FAE5',
    marginBottom: 6,
    fontWeight: '600',
  },
  medicineDoseInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  medicineDoseHeroInput: {
    minWidth: 72,
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    padding: 0,
  },
  medicineDoseHeroUnit: {
    fontSize: 20,
    fontWeight: '800',
    color: '#A7F3D0',
    marginBottom: 6,
  },
  medicineDoseHeroRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF22',
    borderWidth: 2,
    borderColor: '#FFFFFF55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineUnitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicineUnitCard: {
    width: '48%',
    minHeight: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 4,
    shadowColor: '#064E3B',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  medicineUnitCardActive: {
    backgroundColor: '#059669',
    borderColor: '#047857',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  medicineUnitCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineUnitCardIconActive: {
    backgroundColor: '#FFFFFF30',
  },
  medicineUnitCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
  medicineUnitCardTitleActive: {
    color: '#FFFFFF',
  },
  medicineUnitCardHint: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  medicineUnitCardHintActive: {
    color: '#D1FAE5',
  },
  medicineQuickTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginTop: 2,
  },
  medicineQuickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  medicineQuickCard: {
    width: '48%',
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    backgroundColor: '#F8FFFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  medicineQuickCardActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  medicineQuickValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
  medicineQuickValueActive: {
    color: '#047857',
  },
  medicineQuickUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
  },
  medicineQuickUnitActive: {
    color: '#15803D',
  },
  medicineQuickCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  medicineCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#FFFFFF',
  },
  medicineCancelText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  medicineSaveBtn: {
    flex: 2,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#047857',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  medicineSaveText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  editorInput: {
    borderWidth: 1,
    borderColor: '#D7E3F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#233142',
    backgroundColor: '#F8FBFF',
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: '#D7E3F4',
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    color: '#233142',
    backgroundColor: '#F8FBFF',
    outlineStyle: 'none',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#D7E3F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8FBFF',
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  datePickerValue: {
    fontSize: 14,
    color: '#233142',
    fontWeight: '600',
  },
  suggestBox: {
    borderWidth: 1,
    borderColor: '#D7E3F4',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  suggestItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  suggestText: {
    color: '#233142',
    fontWeight: '600',
    fontSize: 14,
  },
  suggestSubText: {
    marginTop: 3,
    color: '#667085',
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    flex: 1,
    minWidth: 88,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  levelChipText: {
    color: '#475467',
    fontWeight: '700',
    fontSize: 13,
  },
  levelChipTextActive: {
    color: '#FFFFFF',
  },
  unitChip: {
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  unitChipActive: {
    backgroundColor: '#1D4ED8',
  },
  unitChipText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
  unitChipTextActive: {
    color: '#FFFFFF',
  },
  categoryChip: {
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: '#1D4ED8',
  },
  categoryChipText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D6E4FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 12,
  },
  tagRemove: {
    color: '#1D4ED8',
    marginLeft: 6,
    fontWeight: '700',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addRowInput: {
    flex: 1,
  },
  addRowButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
  },
  reactionChip: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D6E4FF',
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  reactionChipActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  reactionChipText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
  reactionChipTextActive: {
    color: '#FFFFFF',
  },
  noteTemplateWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteTemplateChip: {
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: '#D6E4FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  noteTemplateText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 12,
  },
  noteTagChip: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noteTagText: {
    color: '#B45309',
    fontWeight: '700',
    fontSize: 12,
  },
  noteCounter: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'right',
  },
  editorInputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  toggleRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E3F4',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8FBFF',
  },
  toggleRowActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#1D4ED8',
  },
  toggleText: {
    fontSize: 14,
    color: '#344054',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#1D4ED8',
  },
  editorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editorCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7E3F4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  editorCancelText: {
    color: '#344054',
    fontWeight: '700',
  },
  editorSaveButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
  },
  editorSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});