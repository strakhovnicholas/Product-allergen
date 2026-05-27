import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

import { saveProfileApi } from '../src/api/profileApi';
import { useAuth } from '../src/context/AuthContext';
import { CHRONIC_DISEASE_LABELS, COLORS } from '../src/styles/palette';

const chronicOptions = Object.entries(CHRONIC_DISEASE_LABELS).map(([code, label]) => ({
  code,
  label,
})) as readonly { code: string; label: string }[];

const allergyOptions = [
  'Пыльца',
  'Молоко',
  'Орехи',
  'Рыба',
  'Пшеница',
  'Цитрусовые',
];

export default function ProfileStep2() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { login } = useAuth();

  const [smoker, setSmoker] = useState<boolean | null>(null);
  const [alcohol, setAlcohol] = useState<boolean | null>(null);
  const [sports, setSports] = useState<boolean | null>(null);

  const [chronicInput, setChronicInput] = useState('');
  const [chronicList, setChronicList] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergyList, setAllergyList] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  const allowedChronic = new Set([
    'ASTHMA',
    'DIABETES',
    'HYPERTENSION',
    'ARTHRITIS',
  ]);

  const handleFinish = async () => {
    if (smoker === null || alcohol === null || sports === null) {
      Alert.alert('Ошибка', 'Выберите все привычки');
      return;
    }

    const accessToken = String(params.accessToken ?? '');
    const refreshToken = String(params.refreshToken ?? '');
    if (!accessToken || !refreshToken) {
      Alert.alert('Ошибка', 'Сессия регистрации устарела. Начните регистрацию заново.');
      router.replace('/register');
      return;
    }

    setLoading(true);

    try {
      await login(accessToken, refreshToken);

      // ===== 2. PROFILE =====

      const fullName = `${params.firstName} ${params.lastName}`;

      const payload = {
        fullName,
        age: Number(params.age),
        weight: Number(params.weight),
        height: Number(params.height),
        country: 'Не указан',
        predisposition: 'NONE' as const,
        gender: String(params.gender || '').toLowerCase() === 'female' ? 'FEMALE' : 'MALE',

        smoker,
        alcohol,
        sports,
        chronicDiseases: chronicList.filter((value) => allowedChronic.has(value)),
        allergies: allergyList,
      };

      await saveProfileApi(payload);

      Alert.alert('Успешно', 'Регистрация завершена');

      router.replace('/(tabs)/diary');
    } catch (e) {
      Alert.alert(
        'Ошибка',
        e instanceof Error ? e.message : 'Ошибка регистрации'
      );
    } finally {
      setLoading(false);
    }
  };

  const SelectButton = ({
    title,
    value,
    selected,
    onPress,
  }: {
    title: string;
    value: boolean;
    selected: boolean | null;
    onPress: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.select,
        selected === value && styles.selectActive,
      ]}
      onPress={() => onPress(value)}
    >
      <Text
        style={[
          styles.selectText,
          selected === value && styles.selectTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

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
    if (!mappedCode || !allowedChronic.has(mappedCode)) {
      Alert.alert('Ошибка', 'Допустимо: астма, диабет, гипертония, артрит');
      return;
    }
    setChronicList((prev) =>
      prev.includes(mappedCode) ? prev : [...prev, mappedCode]
    );
    setChronicInput('');
  };

  const addCustomAllergy = () => {
    const normalized = allergyInput.trim();
    if (!normalized) return;
    setAllergyList((prev) =>
      prev.some((item) => item.toLowerCase() === normalized.toLowerCase())
        ? prev
        : [...prev, normalized]
    );
    setAllergyInput('');
  };

  const toggleChronic = (code: string) => {
    setChronicList((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    );
  };

  const toggleAllergy = (value: string) => {
    setAllergyList((prev) =>
      prev.some((item) => item.toLowerCase() === value.toLowerCase())
        ? prev.filter((item) => item.toLowerCase() !== value.toLowerCase())
        : [...prev, value]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { maxWidth: 860, width: Math.min(width - 20, 860), alignSelf: 'center' },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBlock}>
            <View style={styles.logoCircle}>
              <Ionicons name="medkit-outline" size={34} color="#fff" />
            </View>

            <Text style={styles.title}>Привычки</Text>
            <Text style={styles.subtitle}>Шаг 3 из 3</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.habitHeader}>
              <Ionicons name="flame-outline" size={18} color="#E11D48" />
              <Text style={styles.label}>Курение</Text>
            </View>
            <View style={styles.row}>
              <SelectButton title="Да" value={true} selected={smoker} onPress={setSmoker} />
              <SelectButton title="Нет" value={false} selected={smoker} onPress={setSmoker} />
            </View>

            <View style={styles.habitHeader}>
              <Ionicons name="wine-outline" size={18} color="#D97706" />
              <Text style={styles.label}>Алкоголь</Text>
            </View>
            <View style={styles.row}>
              <SelectButton title="Да" value={true} selected={alcohol} onPress={setAlcohol} />
              <SelectButton title="Нет" value={false} selected={alcohol} onPress={setAlcohol} />
            </View>

            <View style={styles.habitHeader}>
              <Ionicons name="fitness-outline" size={18} color="#22C55E" />
              <Text style={styles.label}>Спорт</Text>
            </View>
            <View style={styles.row}>
              <SelectButton title="Да" value={true} selected={sports} onPress={setSports} />
              <SelectButton title="Нет" value={false} selected={sports} onPress={setSports} />
            </View>

            <View style={styles.habitHeader}>
              <Ionicons name="medkit-outline" size={18} color="#1D4ED8" />
              <Text style={styles.label}>Хронические болезни</Text>
            </View>
            <View style={styles.tagsWrap}>
              {chronicOptions.map((item) => {
                const active = chronicList.includes(item.code);
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.tagChip, active && styles.tagChipActive]}
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
              />
              <TouchableOpacity style={styles.inlineButton} onPress={addCustomChronic}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedWrap}>
              {chronicList.map((item) => (
                <View key={item} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>{CHRONIC_DISEASE_LABELS[item] ?? item}</Text>
                  <TouchableOpacity onPress={() => toggleChronic(item)}>
                    <Ionicons name="close" size={14} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.habitHeader}>
              <Ionicons name="leaf-outline" size={18} color="#7C3AED" />
              <Text style={styles.label}>Аллергии</Text>
            </View>
            <View style={styles.tagsWrap}>
              {allergyOptions.map((item) => {
                const active = allergyList.some((v) => v.toLowerCase() === item.toLowerCase());
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.tagChip, active && styles.tagChipActive]}
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
              />
              <TouchableOpacity style={styles.inlineButton} onPress={addCustomAllergy}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.selectedWrap}>
              {allergyList.map((item) => (
                <View key={item} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>{item}</Text>
                  <TouchableOpacity onPress={() => toggleAllergy(item)}>
                    <Ionicons name="close" size={14} color="#1D4ED8" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleFinish}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Завершить регистрацию</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    width: '100%',
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 48,
  },

  topBlock: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#DCEAF5', marginTop: 6 },

  formCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    marginTop: 14,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  label: { marginBottom: 8, fontWeight: '600', color: COLORS.text },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },

  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagChip: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
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
  selectedWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
  },
  selectedChipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  select: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectActive: {
    backgroundColor: COLORS.primary,
  },

  selectText: { color: COLORS.primary, fontWeight: '600' },

  selectTextActive: { color: '#fff' },

  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  buttonText: { color: '#fff', fontWeight: '700' },
});