import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
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
import { getUserProfileApi, UserProfile } from '../../src/api/profileApi';

type EditorType = 'common' | 'symptom' | 'medicine' | 'food' | 'note';
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

const FOOD_UNIT_LABELS: Record<string, string> = {
  GRAM: 'г',
  PORTION: 'порц',
  PIECE: 'шт',
  MILLILITER: 'мл',
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
  if (!date) return '-';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toLocalDateTimeInputValue(date: string) {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}T${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
}

function toDayKey(value: Date | string) {
  const parsedDate = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return '';
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())}`;
}

function formatDayLabel(value: Date) {
  return value.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isInSelectedDate(date: string, selectedDateKey: string) {
  if (!date) return false;
  return toDayKey(date) === selectedDateKey;
}

function getUserDisplayName(profile: UserProfile | null) {
  const fullName = profile?.fullName?.trim();
  if (!fullName) return 'Здравствуйте';
  const name = fullName.split(' ')[0];
  return `Здравствуйте, ${name}`;
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
          <View style={[styles.sectionIconWrap, { backgroundColor: `${accentColor}22` }]}>
            <Ionicons name={icon} size={18} color={accentColor} />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        <View style={styles.sectionRight}>
          <View style={[styles.countBadge, { backgroundColor: `${accentColor}1F` }]}>
            <Text style={[styles.countBadgeText, { color: accentColor }]}>{count}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAddPress}
            style={[styles.addButton, { backgroundColor: `${accentColor}1F` }]}
          >
            <Ionicons name="add" size={18} color={accentColor} />
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
  children,
  onEdit,
  onDelete,
  deleting,
}: {
  title: string;
  subtitle?: string;
  accentColor: string;
  children?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <View style={[styles.entryCard, { borderLeftColor: accentColor }]}>
      <View style={styles.entryTop}>
        <View style={styles.entryTextBlock}>
          <Text style={styles.entryTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.entrySubtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.entryActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.85}
            disabled={deleting}
          >
            <Ionicons name="create-outline" size={16} color="#1D4ED8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            activeOpacity={0.85}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#1D4ED8" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#1D4ED8" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {!!children && <View style={styles.entryBody}>{children}</View>}
    </View>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

export default function DiaryScreen() {
  const { width } = useWindowDimensions();
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

  const todayDateKey = useMemo(() => toDayKey(new Date()), []);
  const selectedDateKey = useMemo(() => toDayKey(selectedDate), [selectedDate]);
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
      if (delta > 0 && toDayKey(next) > toDayKey(new Date())) {
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
        commonResult.status === 'fulfilled'
          ? commonResult.value
            ? [commonResult.value]
            : []
          : []
      );
      setSymptoms(symptomResult.status === 'fulfilled' ? symptomResult.value ?? [] : []);
      setMedicines(medicineResult.status === 'fulfilled' ? medicineResult.value ?? [] : []);
      setFoods(foodResult.status === 'fulfilled' ? foodResult.value ?? [] : []);
      setNotes(noteResult.status === 'fulfilled' ? noteResult.value ?? [] : []);

      if (commonResult.status === 'fulfilled') {
        setCommonComments((prev) => {
          const next = { ...prev };
          const commonItems = commonResult.value ? [commonResult.value] : [];
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

  useFocusEffect(
    useCallback(() => {
      void loadDiary();
    }, [loadDiary])
  );

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
  commonFeelings.length +
  symptoms.length +
  medicines.length +
  foods.length +
  notes.length;

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
    setFNumber(type === 'common' ? '3' : '');
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
        setFDateTime(item.dateTime ?? new Date().toISOString());
        return;
      }
      if (type === 'symptom') {
        setEditorId(item.id);
        setFName(item.symptomName ?? '');
        const severity = Number(item.severity ?? 5);
        const snapped = severity >= 7 ? 8 : severity >= 4 ? 5 : 2;
        setFNumber(String(snapped));
        setFDateTime(item.startTime || item.createdAt || new Date().toISOString());
        setFDateTimeEnd(item.endTime || '');
        return;
      }
      if (type === 'medicine') {
        setEditorId(item.id);
        setFName(item.medicineName ?? '');
        setFNumber(String(item.dosage ?? ''));
        setFUnit(item.unit ?? 'MG');
        setFDateTime(item.intakeTime || item.intakeDate || new Date().toISOString());
        return;
      }
      if (type === 'food') {
        setEditorId(item.foodIntakeId);
        setFName(item.foodName ?? '');
        setFNumber(String(item.amount ?? ''));
        setFUnit(item.unit ?? 'GRAM');
        setFText2(item.category ?? 'OTHER');
        setFDateTime(item.intakeTime || new Date().toISOString());
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
      setFDateTime(item.date || new Date().toISOString());
    },
    [commonComments]
  );

  const submitEditor = useCallback(async () => {
    if (!editorType) return;
    try {
      setEditorSaving(true);
      if (editorType === 'common') {
        const score = Math.max(1, Math.min(5, Number(fNumber || '3')));
        if (editorId != null) {
          await updateCommonFeelingApi(editorId, {
            dateTime: fDateTime || new Date().toISOString(),
            wellbeingScore: score,
          });
        } else {
          await upsertCommonFeelingApi({
            dateTime: fDateTime || new Date().toISOString(),
            wellbeingScore: score,
          });
        }
      } else if (editorType === 'symptom') {
        if (!fName.trim()) throw new Error('Введите название симптома');
        const fallbackStart = new Date().toISOString();
        const parsedStart = Date.parse(fDateTime);
        const startTime = Number.isNaN(parsedStart) ? fallbackStart : new Date(parsedStart).toISOString();

        const parsedEnd = fDateTimeEnd ? Date.parse(fDateTimeEnd) : Number.NaN;
        const safeEndTime =
          Number.isNaN(parsedEnd)
            ? undefined
            : new Date(Math.max(parsedEnd, Date.parse(startTime))).toISOString();

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
          intakeDate: fDateTime || new Date().toISOString(),
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
          intakeTime: fDateTime || new Date().toISOString(),
          reactionOccurred: fToggle,
          reactionDescription: '',
          components: mergeUnique(foodComponents),
        };
        if (editorId != null) await updateFoodApi(editorId, payload);
        else await createFoodApi(payload);
      } else if (editorType === 'note') {
        if (!fText.trim()) throw new Error('Введите текст заметки');
        const payload = { content: fText.trim(), date: fDateTime || new Date().toISOString() };
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
    selectedProducts,
  ]);

  const renderInlineEditor = useCallback(
    (type: EditorType) => {
      if (editorType !== type) return null;
      const symptomFiltered = symptomCatalog
        .filter((item) => item.toLowerCase().includes(fName.toLowerCase()))
        .slice(0, 12);
      const medicineFiltered = medicineCatalog
        .filter((item) => item.toLowerCase().includes(fName.toLowerCase()))
        .slice(0, 12);
      const commonOptions = [
        { score: 1, label: 'Плохо', color: '#2563EB' },
        { score: 2, label: 'Ниже среднего', color: '#1D4ED8' },
        { score: 3, label: 'Нормально', color: '#0EA5E9' },
        { score: 4, label: 'Хорошо', color: '#38BDF8' },
        { score: 5, label: 'Отлично', color: '#7DD3FC' },
      ];
      const renderEntryDateTimeControl = (label: string) => {
        if (Platform.OS === 'web') {
          return (
            <>
              <Text style={styles.inlineHint}>{label}</Text>
              <input
                style={styles.webDateInput as any}
                type="datetime-local"
                value={toLocalDateTimeInputValue(fDateTime || defaultSelectedDateTime)}
                onChange={(event) => {
                  const nextDate = new Date(event.target.value);
                  if (!Number.isNaN(nextDate.getTime())) {
                    setFDateTime(nextDate.toISOString());
                  }
                }}
              />
            </>
          );
        }

        return (
          <>
            <TouchableOpacity
              style={styles.datePickerButton}
              activeOpacity={0.85}
              onPress={() => setShowEntryDatePicker(true)}
            >
              <Text style={styles.datePickerLabel}>{label}</Text>
              <Text style={styles.datePickerValue}>
                {formatDate(fDateTime || defaultSelectedDateTime)}
              </Text>
            </TouchableOpacity>
            {NativeDateTimePicker && showEntryDatePicker && (
              <NativeDateTimePicker
                value={new Date(fDateTime || defaultSelectedDateTime)}
                mode="datetime"
                onChange={(_event: any, selectedDate?: Date) => {
                  setShowEntryDatePicker(false);
                  if (selectedDate) setFDateTime(selectedDate.toISOString());
                }}
              />
            )}
          </>
        );
      };
      return (
        <View style={styles.inlineEditorCard}>
          <View style={styles.inlineEditorHeader}>
            <Ionicons
              name={
                type === 'common'
                  ? 'heart-circle-outline'
                  : type === 'symptom'
                    ? 'pulse-outline'
                    : type === 'medicine'
                      ? 'medkit-outline'
                      : type === 'food'
                        ? 'restaurant-outline'
                        : 'document-text-outline'
              }
              size={18}
              color="#1D4ED8"
            />
            <Text style={styles.editorTitle}>
              {editorId != null ? 'Редактирование записи' : 'Новая запись'}
            </Text>
          </View>

          {type === 'common' && (
            <>
              <View style={styles.feelingsRow}>
                {commonOptions.map((item) => {
                  const active = Number(fNumber || '3') === item.score;
                  return (
                    <TouchableOpacity
                      key={item.score}
                      style={[styles.feelingDotWrap, active && styles.feelingDotWrapActive]}
                      onPress={() => setFNumber(String(item.score))}
                    >
                      <View style={[styles.feelingDot, { backgroundColor: item.color }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.inlineHint}>
                Выбрано: {commonOptions.find((item) => item.score === Number(fNumber || '3'))?.label ?? 'Нормально'}
              </Text>
            </>
          )}

          {type === 'symptom' && (
            <>
              <TextInput
                style={styles.editorInput}
                value={fName}
                onChangeText={setFName}
                placeholder="Название симптома"
              />
              {!!fName.trim() && symptomFiltered.length > 0 && (
                <View style={styles.suggestBox}>
                  {symptomFiltered.map((item) => (
                    <TouchableOpacity key={item} style={styles.suggestItem} onPress={() => setFName(item)}>
                      <Text style={styles.suggestText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={styles.chipsRow}>
                {[{ title: 'Сильно', value: 8, color: '#1E40AF' }, { title: 'Умеренно', value: 5, color: '#2563EB' }, { title: 'Слабо', value: 2, color: '#0EA5E9' }].map((item) => {
                  const active = Number(fNumber || '5') === item.value;
                  return (
                    <TouchableOpacity
                      key={item.title}
                      style={[styles.levelChip, { borderColor: `${item.color}66` }, active && { backgroundColor: item.color, borderColor: item.color }]}
                      onPress={() => setFNumber(String(item.value))}
                    >
                      <Text style={[styles.levelChipText, active && styles.levelChipTextActive]}>{item.title}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {Platform.OS === 'web' ? (
                <>
                  <Text style={styles.inlineHint}>Начало симптома</Text>
                  <input
                    style={styles.webDateInput as any}
                    type="datetime-local"
                    value={toLocalDateTimeInputValue(fDateTime || new Date().toISOString())}
                    onChange={(event) => {
                      const nextDate = new Date(event.target.value);
                      if (!Number.isNaN(nextDate.getTime())) {
                        setFDateTime(nextDate.toISOString());
                      }
                    }}
                  />
                  <Text style={styles.inlineHint}>Окончание симптома (необязательно)</Text>
                  <input
                    style={styles.webDateInput as any}
                    type="datetime-local"
                    value={toLocalDateTimeInputValue(fDateTimeEnd)}
                    min={toLocalDateTimeInputValue(fDateTime || new Date().toISOString())}
                    onChange={(event) => {
                      if (!event.target.value) {
                        setFDateTimeEnd('');
                        return;
                      }
                      const nextDate = new Date(event.target.value);
                      if (!Number.isNaN(nextDate.getTime())) {
                        setFDateTimeEnd(nextDate.toISOString());
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    activeOpacity={0.85}
                    onPress={() => setShowSymptomStartPicker(true)}
                  >
                    <Text style={styles.datePickerLabel}>Начало симптома</Text>
                    <Text style={styles.datePickerValue}>
                      {formatDate(fDateTime || new Date().toISOString())}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    activeOpacity={0.85}
                    onPress={() => setShowSymptomEndPicker(true)}
                  >
                    <Text style={styles.datePickerLabel}>Окончание симптома</Text>
                    <Text style={styles.datePickerValue}>
                      {fDateTimeEnd ? formatDate(fDateTimeEnd) : 'Не указано'}
                    </Text>
                  </TouchableOpacity>
                  {NativeDateTimePicker && showSymptomStartPicker && (
                    <NativeDateTimePicker
                      value={new Date(fDateTime || new Date().toISOString())}
                      mode="datetime"
                      onChange={(_event: any, selectedDate?: Date) => {
                        setShowSymptomStartPicker(false);
                        if (selectedDate) setFDateTime(selectedDate.toISOString());
                      }}
                    />
                  )}
                  {NativeDateTimePicker && showSymptomEndPicker && (
                    <NativeDateTimePicker
                      value={new Date(fDateTimeEnd || fDateTime || new Date().toISOString())}
                      mode="datetime"
                      onChange={(_event: any, selectedDate?: Date) => {
                        setShowSymptomEndPicker(false);
                        if (selectedDate) setFDateTimeEnd(selectedDate.toISOString());
                      }}
                    />
                  )}
                </>
              )}
            </>
          )}

          {type === 'medicine' && (
            <>
              <TextInput
                style={styles.editorInput}
                value={fName}
                onChangeText={setFName}
                placeholder="Название лекарства"
              />
              {!!fName.trim() && medicineFiltered.length > 0 && (
                <View style={styles.suggestBox}>
                  {medicineFiltered.map((item) => (
                    <TouchableOpacity key={item} style={styles.suggestItem} onPress={() => setFName(item)}>
                      <Text style={styles.suggestText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput
                style={styles.editorInput}
                value={fNumber}
                onChangeText={setFNumber}
                keyboardType="numeric"
                placeholder="Дозировка"
              />
              <View style={styles.chipsRow}>
                {['MG', 'ML', 'TABLET', 'DROP'].map((item) => {
                  const active = (fUnit || 'MG') === item;
                  return (
                    <TouchableOpacity key={item} style={[styles.unitChip, active && styles.unitChipActive]} onPress={() => setFUnit(item)}>
                      <Text style={[styles.unitChipText, active && styles.unitChipTextActive]}>
                        {MEDICINE_UNIT_LABELS[item] ?? item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {renderEntryDateTimeControl('Время приема лекарства')}
            </>
          )}

          {type === 'food' && (
            <>
              <TextInput
                style={styles.editorInput}
                value={fName}
                onChangeText={setFName}
                placeholder="Название блюда (например, салат)"
              />
              <TextInput
                style={styles.editorInput}
                value={foodSearch}
                onChangeText={(text) => {
                  setFoodSearch(text);
                  setFoodSuggestionsOpen(true);
                }}
                onFocus={() => setFoodSuggestionsOpen(true)}
                placeholder="Добавить продукт в блюдо"
              />
              {foodSuggestionsOpen && (
                <View style={styles.suggestBox}>
                  <ScrollView style={{ maxHeight: 160 }}>
                    {foodSuggestions.map((item) => (
                      <TouchableOpacity
                        key={item.foodName}
                        style={styles.suggestItem}
                        onPress={() => {
                          setSelectedProducts((prev) =>
                            prev.some((p) => p.foodName.toLowerCase() === item.foodName.toLowerCase())
                              ? prev
                              : [...prev, item]
                          );
                          setFoodComponents((prev) =>
                            mergeUnique([...prev, ...(item.components ?? [])])
                          );
                          setFText2(item.category ?? 'OTHER');
                          setFoodSearch('');
                          setFoodSuggestionsOpen(false);
                        }}
                      >
                        <Text style={styles.suggestText}>{item.foodName}</Text>
                        {!!item.components?.length && (
                          <Text style={styles.suggestSubText} numberOfLines={1}>
                            {item.components.join(', ')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                    {foodSuggestionsLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}
                  </ScrollView>
                </View>
              )}
              {!!selectedProducts.length && (
                <View style={styles.tagsWrap}>
                  {selectedProducts.map((item) => (
                    <View key={item.foodName} style={styles.tag}>
                      <Text style={styles.tagText}>{item.foodName}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedProducts((prev) => prev.filter((p) => p.foodName !== item.foodName))
                        }
                      >
                        <Text style={styles.tagRemove}>x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <TextInput
                style={styles.editorInput}
                value={fNumber}
                onChangeText={setFNumber}
                keyboardType="numeric"
                placeholder="Количество"
              />
              <View style={styles.chipsRow}>
                {['GRAM', 'PORTION', 'PIECE', 'MILLILITER'].map((item) => {
                  const active = (fUnit || 'GRAM') === item;
                  return (
                    <TouchableOpacity key={item} style={[styles.unitChip, active && styles.unitChipActive]} onPress={() => setFUnit(item)}>
                      <Text style={[styles.unitChipText, active && styles.unitChipTextActive]}>
                        {FOOD_UNIT_LABELS[item] ?? item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.chipsRow}>
                {(['OTHER', 'FRUIT', 'VEGETABLE', 'MEAT', 'DAIRY', 'BEVERAGES'] as const).map((item) => {
                  const active = (fText2 || 'OTHER') === item;
                  return (
                    <TouchableOpacity key={item} style={[styles.categoryChip, active && styles.categoryChipActive]} onPress={() => setFText2(item)}>
                      <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                        {FOOD_CATEGORY_LABELS[item] ?? item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.addRow}>
                <TextInput
                  style={[styles.editorInput, styles.addRowInput]}
                  value={componentInput}
                  onChangeText={setComponentInput}
                  placeholder="Ингредиент"
                />
                <TouchableOpacity
                  style={styles.addRowButton}
                  onPress={() => {
                    if (!componentInput.trim()) return;
                    setFoodComponents((prev) => mergeUnique([...prev, componentInput]));
                    setComponentInput('');
                  }}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {!!foodComponents.length && (
                <View style={styles.tagsWrap}>
                  {foodComponents.map((item) => (
                    <View key={item} style={styles.tag}>
                      <Text style={styles.tagText}>{item}</Text>
                      <TouchableOpacity
                        onPress={() =>
                          setFoodComponents((prev) => prev.filter((component) => component !== item))
                        }
                      >
                        <Text style={styles.tagRemove}>x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={[styles.reactionChip, fToggle && styles.reactionChipActive]}
                  onPress={() => setFToggle(true)}
                >
                  <Text style={[styles.reactionChipText, fToggle && styles.reactionChipTextActive]}>Реакция: Да</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reactionChip, !fToggle && styles.reactionChipActive]}
                  onPress={() => setFToggle(false)}
                >
                  <Text style={[styles.reactionChipText, !fToggle && styles.reactionChipTextActive]}>Реакция: Нет</Text>
                </TouchableOpacity>
              </View>
              {renderEntryDateTimeControl('Время приема еды')}
            </>
          )}

          {type === 'note' && (
            <>
              <View style={styles.noteTemplateWrap}>
                {[
                  'После обеда появилась реакция',
                  'Симптомы усилились к вечеру',
                  'После лекарства стало лучше',
                  'Подозрение на продукт-триггер',
                ].map((item) => (
                  <TouchableOpacity key={item} style={styles.noteTemplateChip} onPress={() => setFText(item)}>
                    <Text style={styles.noteTemplateText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.noteTemplateWrap}>
                {['Триггер', 'Лекарство', 'Симптом', 'Питание'].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.noteTagChip}
                    onPress={() => setFText((prev) => (prev ? `${prev}\n#${tag}` : `#${tag}`))}
                  >
                    <Text style={styles.noteTagText}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.editorInput, styles.editorInputMultiline]}
                value={fText}
                onChangeText={setFText}
                placeholder="Текст заметки"
                multiline
              />
              {renderEntryDateTimeControl('Дата и время заметки')}
              <Text style={styles.noteCounter}>{fText.trim().length} символов</Text>
            </>
          )}

          <View style={styles.editorActions}>
            <TouchableOpacity
              style={styles.editorCancelButton}
              onPress={closeEditor}
              disabled={editorSaving}
            >
              <Text style={styles.editorCancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editorSaveButton}
              onPress={() => void submitEditor()}
              disabled={editorSaving}
            >
              {editorSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.editorSaveText}>Сохранить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [
      closeEditor,
      defaultSelectedDateTime,
      editorId,
      editorSaving,
      editorType,
      fName,
      foodComponents,
      foodSearch,
      foodSuggestions,
      foodSuggestionsLoading,
      foodSuggestionsOpen,
      fNumber,
      fText,
      fText2,
      fToggle,
      fUnit,
      fDateTimeEnd,
      medicineCatalog,
      mergeUnique,
      selectedProducts,
      showEntryDatePicker,
      symptomCatalog,
      submitEditor,
    ]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, { maxWidth: 860, width: Math.min(width - 20, 860), alignSelf: 'center' }]}
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
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroAvatar}>
              <Ionicons name="person" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroTitle}>{getUserDisplayName(profile)}</Text>
              <Text style={styles.heroSubtitle}>Все записи и изменения за день</Text>
            </View>
          </View>

          <View style={styles.heroInnerCard}>
            <Text style={styles.heroInnerTitle}>Сегодня</Text>
            <Text style={styles.heroInnerText}>
              Добавляйте самочувствие, симптомы, лекарства, питание и заметки.
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{totalCount}</Text>
                <Text style={styles.summaryLabel}>Записей</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{filteredFoods.length}</Text>
                <Text style={styles.summaryLabel}>Питание</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{filteredSymptoms.length}</Text>
                <Text style={styles.summaryLabel}>Симптомы</Text>
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
          icon="heart-circle-outline"
          accentColor="#1D4ED8"
          onAddPress={() => openCreateEditor('common')}
        >
          {renderInlineEditor('common')}
          {filteredCommonFeelings.length === 0 ? (
            <EmptySection text="Записей самочувствия пока нет" />
          ) : (
            filteredCommonFeelings.map((item) => (
              <EntryCard
                key={`common-${item.feelingId}`}
                title={`Самочувствие ${toFiveScale(item.wellbeingScore)}/5`}
                subtitle={formatDate(item.dateTime)}
                accentColor="#1D4ED8"
                deleting={deletingId === `common-${item.feelingId}`}
                onEdit={() => openEditEditor('common', item)}
                onDelete={() =>
                  confirmDelete(
                    `common-${item.feelingId}`,
                    `Самочувствие ${item.wellbeingScore}/10`,
                    async () => {
                      await deleteCommonFeelingApi(item.feelingId);
                    }
                  )
                }
              >
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Симптомы"
          count={filteredSymptoms.length}
          icon="pulse-outline"
          accentColor="#1D4ED8"
          onAddPress={() => openCreateEditor('symptom')}
        >
          {renderInlineEditor('symptom')}
          {filteredSymptoms.length === 0 ? (
            <EmptySection text="Симптомов пока нет" />
          ) : (
            filteredSymptoms.map((item) => (
              <EntryCard
                key={`symptom-${item.id}`}
                title={item.symptomName}
                subtitle={formatDate(item.startTime || item.createdAt || '')}
                accentColor="#1D4ED8"
                deleting={deletingId === `symptom-${item.id}`}
                onEdit={() => openEditEditor('symptom', item)}
                onDelete={() =>
                  confirmDelete(
                    `symptom-${item.id}`,
                    item.symptomName,
                    async () => {
                      await deleteSymptomApi(item.id);
                    }
                  )
                }
              >
                <MetaRow label="Сила" value={`${toSeverityLabel(item.severity)} (${item.severity}/10)`} />
                <MetaRow
                  label="Начало"
                  value={formatDate(item.startTime || item.createdAt || '')}
                />
                <MetaRow
                  label="Окончание"
                  value={item.endTime ? formatDate(item.endTime) : 'Не указано'}
                />
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Лекарства"
          count={filteredMedicines.length}
          icon="medkit-outline"
          accentColor="#0EA5E9"
          onAddPress={() => openCreateEditor('medicine')}
        >
          {renderInlineEditor('medicine')}
          {filteredMedicines.length === 0 ? (
            <EmptySection text="Лекарств пока нет" />
          ) : (
            filteredMedicines.map((item) => (
              <EntryCard
                key={`medicine-${item.id}`}
                title={item.medicineName}
                subtitle={formatDate(item.intakeTime || item.intakeDate || '')}
                accentColor="#0EA5E9"
                deleting={deletingId === `medicine-${item.id}`}
                onEdit={() => openEditEditor('medicine', item)}
                onDelete={() =>
                  confirmDelete(
                    `medicine-${item.id}`,
                    item.medicineName,
                    async () => {
                      await deleteMedicineApi(item.id);
                    }
                  )
                }
              >
                <MetaRow
                  label="Дозировка"
                  value={
                    item.dosage != null
                      ? `${item.dosage} ${MEDICINE_UNIT_LABELS[item.unit ?? ''] ?? item.unit ?? ''}`.trim()
                      : '-'
                  }
                />
                <MetaRow
                  label="Время"
                  value={formatDate(item.intakeTime || item.intakeDate || '')}
                />
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Питание"
          count={filteredFoods.length}
          icon="restaurant-outline"
          accentColor="#1D4ED8"
          onAddPress={() => openCreateEditor('food')}
        >
          {renderInlineEditor('food')}
          {filteredFoods.length === 0 ? (
            <EmptySection text="Записей о питании пока нет" />
          ) : (
            filteredFoods.map((item) => (
              <EntryCard
                key={`food-${item.foodIntakeId}`}
                title={item.foodName}
                subtitle={formatDate(item.intakeTime)}
                accentColor="#1D4ED8"
                deleting={deletingId === `food-${item.foodIntakeId}`}
                onEdit={() => openEditEditor('food', item)}
                onDelete={() =>
                  confirmDelete(
                    `food-${item.foodIntakeId}`,
                    item.foodName,
                    async () => {
                      await deleteFoodApi(item.foodIntakeId);
                    }
                  )
                }
              >
                <MetaRow
                  label="Категория"
                  value={
                    (FOOD_CATEGORY_LABELS[item.category ?? ''] ?? item.category) || '-'
                  }
                />
                <MetaRow
                  label="Количество"
                  value={
                    item.amount != null
                      ? `${item.amount} ${FOOD_UNIT_LABELS[item.unit ?? ''] ?? item.unit ?? ''}`.trim()
                      : '-'
                  }
                />
                <MetaRow
                  label="Реакция"
                  value={item.reactionOccurred ? 'Да' : 'Нет'}
                />
                <MetaRow
                  label="Ингредиенты"
                  value={item.components?.length ? item.components.join(', ') : '-'}
                />
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Заметки"
          count={filteredNotes.length}
          icon="document-text-outline"
          accentColor="#1D4ED8"
          onAddPress={() => openCreateEditor('note')}
        >
          {renderInlineEditor('note')}
          {filteredNotes.length === 0 ? (
            <EmptySection text="Заметок пока нет" />
          ) : (
            filteredNotes.map((item) => (
              <EntryCard
                key={`note-${item.noteId}`}
                title={formatDate(item.date)}
                subtitle="Заметка"
                accentColor="#1D4ED8"
                deleting={deletingId === `note-${item.noteId}`}
                onEdit={() => openEditEditor('note', item)}
                onDelete={() =>
                  confirmDelete(
                    `note-${item.noteId}`,
                    formatDate(item.date),
                    async () => {
                      await deleteNoteApi(item.noteId);
                    }
                  )
                }
              >
                <Text style={styles.noteText}>{item.content}</Text>
              </EntryCard>
            ))
          )}
        </SectionBlock>

      </ScrollView>
    </SafeAreaView>
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
    borderRadius: 30,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7AA4E7',
    borderWidth: 2,
    borderColor: '#FFFFFF66',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heroTitleWrap: {
    flex: 1,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroSubtitle: {
    color: '#D8E7F3',
    fontSize: 13,
    lineHeight: 18,
  },
  heroInnerCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    padding: 18,
  },
  heroInnerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroInnerText: {
    color: '#EAF2FF',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: '#5B98F8',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#DCEAF5',
    fontSize: 12,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#FFFFFF33',
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
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
  },
  sectionIconWrap: {
    width: 34,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#233142',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 34,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    minWidth: 36,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  entryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  entryTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 13,
    color: '#667085',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },

  metaRow: {
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: '#98A2B3',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: '#344054',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#344054',
    lineHeight: 21,
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
  feelingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  feelingDotWrap: {
    padding: 4,
    borderRadius: 20,
  },
  feelingDotWrapActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  feelingDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
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