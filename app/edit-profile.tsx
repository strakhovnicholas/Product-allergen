import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getUserProfileApi,
  updateUserProfileApi,
  type Profile,
} from '../src/api/profileApi';
import { ApiRequestError } from '../src/api/client';
import { CHRONIC_DISEASE_LABELS, COLORS } from '../src/styles/palette';

const chronicOptions = Object.entries(CHRONIC_DISEASE_LABELS).map(([code, label]) => ({
  code,
  label,
}));

const allergyOptions = ['Пыльца', 'Молоко', 'Орехи', 'Рыба', 'Пшеница', 'Цитрусовые'];

const ALLOWED_CHRONIC = new Set(['ASTHMA', 'DIABETES', 'HYPERTENSION', 'ARTHRITIS']);

const PREDISPOSITION_OPTIONS = [
  { code: 'NONE', label: 'Отсутствует' },
  { code: 'LOW', label: 'Низкая' },
  { code: 'MEDIUM', label: 'Средняя' },
  { code: 'HIGH', label: 'Высокая' },
] as const;

function normalizeChronicCodes(values: string[] | undefined) {
  if (!Array.isArray(values)) return [];
  const codes: string[] = [];
  for (const value of values) {
    const trimmed = String(value || '').trim();
    if (!trimmed) continue;
    const upper = trimmed.toUpperCase();
    if (ALLOWED_CHRONIC.has(upper)) {
      if (!codes.includes(upper)) codes.push(upper);
      continue;
    }
    const byLabel = Object.entries(CHRONIC_DISEASE_LABELS).find(
      ([, label]) => label.toLowerCase() === trimmed.toLowerCase(),
    );
    if (byLabel && !codes.includes(byLabel[0])) codes.push(byLabel[0]);
  }
  return codes;
}

function normalizePredisposition(value?: string): Profile['predisposition'] {
  const upper = String(value || '').toUpperCase();
  if (upper === 'LOW' || upper === 'MEDIUM' || upper === 'HIGH') return upper;
  return 'NONE';
}

function HabitToggle({
  title,
  subtitle,
  icon,
  accentColor,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View
      style={[
        styles.habitCard,
        { backgroundColor: `${accentColor}0C`, borderColor: `${accentColor}28` },
      ]}
    >
      <View style={[styles.habitStripe, { backgroundColor: accentColor }]} />
      <View style={styles.habitMain}>
        <View style={styles.habitHead}>
          <View style={[styles.habitIconWrap, { backgroundColor: `${accentColor}1A` }]}>
            <Ionicons name={icon} size={18} color={accentColor} />
          </View>
          <View style={styles.habitText}>
            <Text style={styles.habitTitle}>{title}</Text>
            <Text style={styles.habitSubtitle}>{subtitle}</Text>
          </View>
          <View style={[styles.habitBadge, { backgroundColor: `${accentColor}18` }]}>
            <Text style={[styles.habitBadgeText, { color: accentColor }]}>
              {value ? 'Да' : 'Нет'}
            </Text>
          </View>
        </View>
        <View style={styles.habitChoices}>
          <TouchableOpacity
            style={[
              styles.choiceBtn,
              value === true && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            activeOpacity={0.85}
            onPress={() => onChange(true)}
          >
            <Text style={[styles.choiceText, value === true && styles.choiceTextActive]}>Да</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.choiceBtn,
              value === false && { backgroundColor: accentColor, borderColor: accentColor },
            ]}
            activeOpacity={0.85}
            onPress={() => onChange(false)}
          >
            <Text style={[styles.choiceText, value === false && styles.choiceTextActive]}>Нет</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FormSection({
  title,
  icon,
  accentColor,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIconWrap, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={icon} size={18} color={accentColor} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState<any>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [smoker, setSmoker] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [sports, setSports] = useState(false);

  const [chronicInput, setChronicInput] = useState('');
  const [chronicList, setChronicList] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergyList, setAllergyList] = useState<string[]>([]);
  const [predisposition, setPredisposition] = useState<Profile['predisposition']>('NONE');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const profile = await getUserProfileApi();
      setProfileSnapshot(profile ?? null);

      const parts = (profile?.fullName || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts[1] || '');
      setAge(profile?.age !== undefined ? String(profile.age) : '');
      setWeight(profile?.weight !== undefined ? String(profile.weight) : '');
      setHeight(profile?.height !== undefined ? String(profile.height) : '');

      setSmoker(Boolean(profile?.smoker));
      setAlcohol(Boolean(profile?.alcohol));
      setSports(Boolean(profile?.sports));

      setChronicList(normalizeChronicCodes(profile?.chronicDiseases));
      setAllergyList(
        Array.isArray(profile?.allergies)
          ? profile.allergies.map((item) => String(item).trim()).filter(Boolean)
          : [],
      );
      setPredisposition(normalizePredisposition(profile?.predisposition));
      setChronicInput('');
      setAllergyInput('');
    } catch {
      Alert.alert('Ошибка', 'Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  const toggleChronic = (code: string) => {
    setChronicList((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code],
    );
  };

  const addCustomChronic = () => {
    const normalized = chronicInput.trim().toLowerCase();
    if (!normalized) return;
    const dictionary: Record<string, string> = {
      астма: 'ASTHMA',
      диабет: 'DIABETES',
      гипертония: 'HYPERTENSION',
      артрит: 'ARTHRITIS',
    };
    const mappedCode = dictionary[normalized];
    if (!mappedCode || !ALLOWED_CHRONIC.has(mappedCode)) {
      Alert.alert('Подсказка', 'Допустимо: астма, диабет, гипертония, артрит');
      return;
    }
    setChronicList((prev) => (prev.includes(mappedCode) ? prev : [...prev, mappedCode]));
    setChronicInput('');
  };

  const toggleAllergy = (value: string) => {
    setAllergyList((prev) =>
      prev.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev.filter((item) => item.toLowerCase() !== value.toLowerCase())
        : [...prev, value],
    );
  };

  const addCustomAllergy = () => {
    const normalized = allergyInput.trim();
    if (!normalized) return;
    setAllergyList((prev) =>
      prev.some((item) => item.toLowerCase() === normalized.toLowerCase())
        ? prev
        : [...prev, normalized],
    );
    setAllergyInput('');
  };

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Введите имя и фамилию');
      return;
    }

    try {
      setSaving(true);

      const normalizedCountry =
        typeof profileSnapshot?.country === 'string' && profileSnapshot.country.trim()
          ? profileSnapshot.country.trim()
          : 'Не указан';

      const normalizedGender = String(profileSnapshot?.gender || '').toUpperCase();
      const ageValue = age ? Number(age) : Number(profileSnapshot?.age);
      const weightValue = weight ? Number(weight) : Number(profileSnapshot?.weight);
      const heightValue = height ? Number(height) : Number(profileSnapshot?.height);

      const payload: any = {
        fullName: `${firstName} ${lastName}`,
        country: normalizedCountry,
        gender: normalizedGender === 'FEMALE' ? 'FEMALE' : 'MALE',
        predisposition: normalizePredisposition(predisposition),
        chronicDiseases: chronicList.filter((code) => ALLOWED_CHRONIC.has(code)),
        allergies: allergyList,
        medicationsRegular: Array.isArray(profileSnapshot?.medicationsRegular)
          ? profileSnapshot.medicationsRegular
          : [],
        doctorNotes:
          typeof profileSnapshot?.doctorNotes === 'string' ? profileSnapshot.doctorNotes : '',
        smoker,
        alcohol,
        sports,
      };

      if (Number.isFinite(ageValue)) payload.age = ageValue;
      if (Number.isFinite(weightValue)) payload.weight = weightValue;
      if (Number.isFinite(heightValue)) payload.height = heightValue;

      const profileUserId =
        typeof profileSnapshot?.userId === 'string' && profileSnapshot.userId.trim()
          ? profileSnapshot.userId.trim()
          : undefined;

      await updateUserProfileApi({
        ...payload,
        userId: profileUserId ?? profileSnapshot?.userId,
      });

      Alert.alert('Успешно', 'Профиль обновлён');
      router.back();
    } catch (e) {
      if (e instanceof ApiRequestError) {
        Alert.alert('Ошибка сохранения', e.message);
      } else {
        Alert.alert(
          'Ошибка сохранения',
          e instanceof Error ? e.message : 'Проверьте введенные данные',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenSafeArea style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
            <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.topBarText}>
            <Text style={styles.screenTitle}>Изменить профиль</Text>
            <Text style={styles.screenSubtitle}>Изменения сохраняются на сервере</Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <FormSection title="Основные данные" icon="person-outline" accentColor={COLORS.primary}>
            <Text style={styles.label}>Имя</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Фамилия</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

            <View style={styles.rowSplit}>
              <View style={styles.rowSplitCell}>
                <Text style={styles.label}>Возраст</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rowSplitCell}>
                <Text style={styles.label}>Вес (кг)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.label}>Рост (см)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
          </FormSection>

          <FormSection
            title="Предрасположенность"
            icon="pulse-outline"
            accentColor={COLORS.success}
          >
            <Text style={styles.hint}>Уровень риска аллергических реакций</Text>
            <View style={styles.tagsWrap}>
              {PREDISPOSITION_OPTIONS.map((item) => {
                const active = predisposition === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.tagChip, active && styles.tagChipActive]}
                    activeOpacity={0.85}
                    onPress={() => setPredisposition(item.code)}
                  >
                    <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </FormSection>

          <FormSection title="Хронические заболевания" icon="medkit-outline" accentColor={COLORS.primary}>
            <Text style={styles.hint}>Выберите из списка или введите название</Text>
            <View style={styles.tagsWrap}>
              {chronicOptions.map((item) => {
                const active = chronicList.includes(item.code);
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.tagChip, active && styles.tagChipActive]}
                    activeOpacity={0.85}
                    onPress={() => toggleChronic(item.code)}
                  >
                    <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputInline]}
                value={chronicInput}
                onChangeText={setChronicInput}
                placeholder="Например: астма"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.inlineButton} onPress={addCustomChronic}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedWrap}>
              {chronicList.length === 0 ? (
                <Text style={styles.emptyHint}>Пока не выбрано</Text>
              ) : (
                chronicList.map((item) => (
                  <View key={item} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>
                      {CHRONIC_DISEASE_LABELS[item] ?? item}
                    </Text>
                    <TouchableOpacity onPress={() => toggleChronic(item)}>
                      <Ionicons name="close" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </FormSection>

          <FormSection title="Аллергии" icon="leaf-outline" accentColor={COLORS.danger}>
            <Text style={styles.hint}>Быстрый выбор или своя аллергия</Text>
            <View style={styles.tagsWrap}>
              {allergyOptions.map((item) => {
                const active = allergyList.some((v) => v.toLowerCase() === item.toLowerCase());
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.tagChip, active && styles.tagChipActive]}
                    activeOpacity={0.85}
                    onPress={() => toggleAllergy(item)}
                  >
                    <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputInline]}
                value={allergyInput}
                onChangeText={setAllergyInput}
                placeholder="Добавить аллергию"
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity style={styles.inlineButton} onPress={addCustomAllergy}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedWrap}>
              {allergyList.length === 0 ? (
                <Text style={styles.emptyHint}>Пока не добавлено</Text>
              ) : (
                allergyList.map((item) => (
                  <View key={item} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{item}</Text>
                    <TouchableOpacity onPress={() => toggleAllergy(item)}>
                      <Ionicons name="close" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </FormSection>

          <FormSection title="Образ жизни" icon="fitness-outline" accentColor={COLORS.warning}>
            <Text style={styles.hint}>Укажите привычки — так точнее анализ и отчёты</Text>
            <View style={styles.habitList}>
              <HabitToggle
                title="Курение"
                subtitle="Табачные привычки"
                icon="flame-outline"
                accentColor={COLORS.warning}
                value={smoker}
                onChange={setSmoker}
              />
              <HabitToggle
                title="Алкоголь"
                subtitle="Употребление алкоголя"
                icon="wine-outline"
                accentColor={COLORS.danger}
                value={alcohol}
                onChange={setAlcohol}
              />
              <HabitToggle
                title="Спорт"
                subtitle="Физическая активность"
                icon="fitness-outline"
                accentColor={COLORS.success}
                value={sports}
                onChange={setSports}
              />
            </View>
          </FormSection>

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Сохранить профиль</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  flex: {
    flex: 1,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarText: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
  },
  hint: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 18,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDE4EE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: '#0F172A',
    backgroundColor: '#F8FBFF',
  },
  rowSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  rowSplitCell: {
    flex: 1,
  },
  habitList: {
    gap: 10,
  },
  habitCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  habitStripe: {
    width: 5,
  },
  habitMain: {
    flex: 1,
    padding: 12,
    gap: 10,
  },
  habitHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  habitIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  habitText: {
    flex: 1,
    minWidth: 0,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
  },
  habitSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  habitBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  habitBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  habitChoices: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagChip: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
  },
  tagChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tagChipTextActive: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputInline: {
    flex: 1,
    marginBottom: 0,
  },
  inlineButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 28,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
  },
  selectedChipText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyHint: {
    fontSize: 13,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  button: {
    marginTop: 4,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});
