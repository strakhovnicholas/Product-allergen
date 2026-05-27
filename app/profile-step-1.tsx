import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    NativeScrollEvent,
    NativeSyntheticEvent,
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
import { COLORS } from '../src/styles/palette';

type Gender = 'male' | 'female' | null;

const AGE_MIN = 5;
const AGE_MAX = 100;
const WEIGHT_MIN = 25;
const WEIGHT_MAX = 220;
const HEIGHT_MIN = 120;
const HEIGHT_MAX = 220;
const PICKER_ITEM_HEIGHT = 42;
const PICKER_VISIBLE_ITEMS = 5;

function VerticalNumberPicker({
  label,
  unit,
  icon,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  min: number;
  max: number;
  value: number;
  onChange: (next: number) => void;
}) {
  const values = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => max - i),
    [min, max]
  );
  const scrollRef = useRef<ScrollView | null>(null);
  const pickerHeight = PICKER_ITEM_HEIGHT * PICKER_VISIBLE_ITEMS;

  useEffect(() => {
    const index = values.findIndex((v) => v === value);
    if (index >= 0) {
      scrollRef.current?.scrollTo({
        y: index * PICKER_ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [value, values]);

  const onEndScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / PICKER_ITEM_HEIGHT);
    const index = Math.max(0, Math.min(values.length - 1, rawIndex));
    onChange(values[index]);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const rawIndex = Math.round(offsetY / PICKER_ITEM_HEIGHT);
    const index = Math.max(0, Math.min(values.length - 1, rawIndex));
    const next = values[index];
    if (next !== value) {
      onChange(next);
    }
  };

  return (
    <View style={styles.metricWheelCard}>
      <View style={styles.metricWheelHead}>
        <Ionicons name={icon} size={18} color="#1D4ED8" />
        <Text style={styles.metricWheelTitle}>{label}</Text>
        <Text style={styles.metricWheelValue}>
          {value} {unit}
        </Text>
      </View>

      <View style={[styles.metricWheelWrap, { height: pickerHeight }]}>
        <View style={styles.metricWheelCenterMarker} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={PICKER_ITEM_HEIGHT}
          decelerationRate="fast"
          nestedScrollEnabled
          scrollEventThrottle={16}
          onScroll={onScroll}
          onMomentumScrollEnd={onEndScroll}
          onScrollEndDrag={onEndScroll}
          contentContainerStyle={{
            paddingVertical: PICKER_ITEM_HEIGHT * 2,
          }}
        >
          {values.map((num) => {
            const active = num === value;
            return (
              <TouchableOpacity
                key={num}
                activeOpacity={0.85}
                onPress={() => onChange(num)}
                style={[
                  styles.metricWheelItem,
                  { height: PICKER_ITEM_HEIGHT },
                  active && styles.metricWheelItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.metricWheelText,
                    active && styles.metricWheelTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export default function ProfileStep1() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ageInput, setAgeInput] = useState('25');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState<Gender>(null);

  const parsedAge = Number(ageInput);
  const ageError =
    ageInput.length === 0
      ? 'Введите возраст'
      : Number.isNaN(parsedAge) || parsedAge < AGE_MIN || parsedAge > AGE_MAX
        ? `Возраст должен быть от ${AGE_MIN} до ${AGE_MAX}`
        : '';
  const isAgeValid = ageError.length === 0;

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const handleNext = () => {
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Введите имя и фамилию');
      return;
    }
    if (!isAgeValid) {
      Alert.alert('Ошибка', ageError);
      return;
    }
    const age = parsedAge;

    if (!gender) {
      Alert.alert('Ошибка', 'Выберите пол');
      return;
    }

    router.push({
      pathname: '/profile-step-2',
      params: {
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,

        firstName,
        lastName,
        age: String(age),
        weight: String(weight),
        height: String(height),
        gender,
      },
    });
  };

  const SelectButton = ({
    title,
    value,
    selected,
    onPress,
  }: {
    title: string;
    value: Exclude<Gender, null>;
    selected: Gender;
    onPress: (value: Exclude<Gender, null>) => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.selectButton,
        selected === value && styles.selectButtonActive,
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBlock}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-outline" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Данные пользователя</Text>
            <Text style={styles.stepText}>Шаг 2 из 3</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Имя</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Фамилия</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

            <Text style={styles.label}>Возраст</Text>
            <TextInput
              style={styles.input}
              value={ageInput}
              onChangeText={(text) => {
                const digitsOnly = text.replace(/[^\d]/g, '');
                setAgeInput(digitsOnly);
              }}
              keyboardType="numeric"
              placeholder="Введите возраст"
              maxLength={3}
            />
          {!!ageError && <Text style={styles.fieldError}>{ageError}</Text>}

            <Text style={styles.label}>Параметры тела</Text>
            <View style={styles.wheelsRow}>
              <VerticalNumberPicker
                label="Вес"
                unit="кг"
                icon="barbell-outline"
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                value={weight}
                onChange={(next) => setWeight(clamp(next, WEIGHT_MIN, WEIGHT_MAX))}
              />
              <VerticalNumberPicker
                label="Рост"
                unit="см"
                icon="resize-outline"
                min={HEIGHT_MIN}
                max={HEIGHT_MAX}
                value={height}
                onChange={(next) => setHeight(clamp(next, HEIGHT_MIN, HEIGHT_MAX))}
              />
            </View>

            <Text style={styles.label}>Пол</Text>

            <View style={styles.row}>
              <SelectButton
                title="Мужской"
                value="male"
                selected={gender}
                onPress={setGender}
              />

              <SelectButton
                title="Женский"
                value="female"
                selected={gender}
                onPress={setGender}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, !isAgeValid && styles.buttonDisabled]}
              onPress={handleNext}
              disabled={!isAgeValid}
            >
              <Text style={styles.buttonText}>Далее</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

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

  title: {
    color: COLORS.surface,
    fontSize: 26,
    fontWeight: '700',
  },

  stepText: {
    color: '#DCEAF5',
    marginTop: 6,
  },

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

  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: COLORS.text,
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
  fieldError: {
    marginTop: -10,
    marginBottom: 12,
    color: '#B42318',
    fontSize: 12,
    fontWeight: '600',
  },
  wheelsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricWheelCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    padding: 10,
  },
  metricWheelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricWheelTitle: {
    marginLeft: 6,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  metricWheelValue: {
    marginLeft: 'auto',
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  metricWheelWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.background,
  },
  metricWheelCenterMarker: {
    position: 'absolute',
    top: PICKER_ITEM_HEIGHT * 2,
    left: 8,
    right: 8,
    height: PICKER_ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: 'rgba(219, 234, 254, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(214, 228, 239, 0.8)',
    zIndex: 2,
  },
  metricWheelItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricWheelItemActive: {
    zIndex: 3,
  },
  metricWheelText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  metricWheelTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  selectButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectButtonActive: {
    backgroundColor: COLORS.primary,
  },

  selectText: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  selectTextActive: {
    color: '#FFFFFF',
  },

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
  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});