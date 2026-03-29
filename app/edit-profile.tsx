import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getUserProfileApi,
  updateUserProfileApi,
} from '../src/api/profileApi';
import {
  validateEmail,
  validateFullName,
} from '../src/utils/validation';

function parseOptionalNumber(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): number | undefined {
  const normalized = value.trim();

  if (!normalized) return undefined;

  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error(`Поле "${fieldName}" должно быть числом`);
  }

  if (min !== undefined && parsed < min) {
    throw new Error(`Поле "${fieldName}" должно быть не меньше ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new Error(`Поле "${fieldName}" должно быть не больше ${max}`);
  }

  return parsed;
}

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [sport, setSport] = useState(false);
  const [heredity, setHeredity] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const profile = await getUserProfileApi();

      setFullName(profile?.fullName ?? '');
      setEmail(profile?.email ?? '');
      setAge(
        typeof profile?.age === 'number' ? String(profile.age) : ''
      );
      setWeight(
        typeof profile?.weight === 'number' ? String(profile.weight) : ''
      );
      setHeight(
        typeof profile?.height === 'number' ? String(profile.height) : ''
      );
      setSmoking(Boolean(profile?.smoking));
      setAlcohol(Boolean(profile?.alcohol));
      setSport(Boolean(profile?.sport));
      setHeredity(Boolean(profile?.heredity));
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось загрузить профиль'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const handleSave = async () => {
    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim();

    const fullNameError = validateFullName(normalizedFullName);
    if (fullNameError) {
      Alert.alert('Ошибка', fullNameError);
      return;
    }

    if (normalizedEmail) {
      const emailError = validateEmail(normalizedEmail);
      if (emailError) {
        Alert.alert('Ошибка', emailError);
        return;
      }
    }

    try {
      const parsedAge = parseOptionalNumber(age, 'Возраст', 0, 120);
      const parsedWeight = parseOptionalNumber(weight, 'Вес', 1, 500);
      const parsedHeight = parseOptionalNumber(height, 'Рост', 30, 300);

      setSaving(true);

      await updateUserProfileApi({
        fullName: normalizedFullName,
        age: parsedAge,
        weight: parsedWeight,
        height: parsedHeight,
        smoking,
        alcohol,
        sport,
        heredity,
      });

      Alert.alert('Успешно', 'Профиль обновлён');
      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить профиль'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#2F6690" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Ionicons name="arrow-back" size={24} color="#233142" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Редактировать профиль</Text>
        <Text style={styles.subtitle}>
          Измените основные данные и параметры образа жизни
        </Text>

        <Text style={styles.label}>ФИО</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Введите ФИО"
          placeholderTextColor="#98A2B3"
          editable={!saving}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={email}
          onChangeText={setEmail}
          placeholder="Введите email"
          placeholderTextColor="#98A2B3"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={false}
        />

        <Text style={styles.helperText}>
          Email отображается из профиля. Сохранение email лучше делать только если backend это поддерживает отдельным endpoint.
        </Text>

        <Text style={styles.label}>Возраст</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Введите возраст"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          editable={!saving}
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Введите вес"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          editable={!saving}
        />

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="Введите рост"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          editable={!saving}
        />

        <Text style={styles.sectionTitle}>Образ жизни</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Курение</Text>
          <Switch value={smoking} onValueChange={setSmoking} disabled={saving} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Алкоголь</Text>
          <Switch value={alcohol} onValueChange={setAlcohol} disabled={saving} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Спорт</Text>
          <Switch value={sport} onValueChange={setSport} disabled={saving} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Наследственность</Text>
          <Switch value={heredity} onValueChange={setHeredity} disabled={saving} />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить изменения</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#101828',
  },
  disabledInput: {
    backgroundColor: '#F8FAFC',
    color: '#667085',
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#667085',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#233142',
    marginTop: 28,
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 15,
    color: '#233142',
    fontWeight: '500',
  },
  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});