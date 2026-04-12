import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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

import { createUserProfileApi } from '../src/api/profileApi';
import { useAuth } from '../src/context/AuthContext';
import { validateFullName } from '../src/utils/validation';

function parseRequiredNumber(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): number {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`Заполните поле "${fieldName}"`);
  }

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

export default function ProfileSetup() {
  const { logout } = useAuth();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [sport, setSport] = useState(false);
  const [heredity, setHeredity] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLogoutSubmitting, setIsLogoutSubmitting] = useState(false);

  const handleSave = async () => {
    const normalizedFullName = fullName.trim();

    const fullNameError = validateFullName(normalizedFullName);
    if (fullNameError) {
      Alert.alert('Ошибка', fullNameError);
      return;
    }

    try {
      const parsedAge = parseRequiredNumber(age, 'Возраст', 0, 120);
      const parsedWeight = parseRequiredNumber(weight, 'Вес', 1, 500);
      const parsedHeight = parseRequiredNumber(height, 'Рост', 30, 300);

      setIsSubmitting(true);

      await createUserProfileApi({
        fullName: normalizedFullName,
        age: parsedAge,
        weight: parsedWeight,
        height: parsedHeight,
        smoking,
        alcohol,
        sport,
        heredity,
      });

      Alert.alert('Успешно', 'Профиль сохранён');
      router.replace('/(tabs)' as any);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить профиль'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти из аккаунта?', [
      {
        text: 'Отмена',
        style: 'cancel',
      },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLogoutSubmitting(true);
            await logout();
            router.replace('/login' as any);
          } catch (error) {
            Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
          } finally {
            setIsLogoutSubmitting(false);
          }
        },
      },
    ]);
  };

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
            disabled={isSubmitting || isLogoutSubmitting}
          >
            <Ionicons name="arrow-back" size={24} color="#233142" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Заполнение профиля</Text>
        <Text style={styles.subtitle}>
          Эти данные помогут анализировать симптомы и триггеры
        </Text>

        <Text style={styles.label}>ФИО</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите ФИО"
          placeholderTextColor="#98A2B3"
          value={fullName}
          onChangeText={setFullName}
          editable={!isSubmitting && !isLogoutSubmitting}
        />

        <Text style={styles.label}>Возраст</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите возраст"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          editable={!isSubmitting && !isLogoutSubmitting}
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите вес"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          editable={!isSubmitting && !isLogoutSubmitting}
        />

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите рост"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
          editable={!isSubmitting && !isLogoutSubmitting}
        />

        <Text style={styles.section}>Образ жизни</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Курение</Text>
          <Switch
            value={smoking}
            onValueChange={setSmoking}
            disabled={isSubmitting || isLogoutSubmitting}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Алкоголь</Text>
          <Switch
            value={alcohol}
            onValueChange={setAlcohol}
            disabled={isSubmitting || isLogoutSubmitting}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Спорт</Text>
          <Switch
            value={sport}
            onValueChange={setSport}
            disabled={isSubmitting || isLogoutSubmitting}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Наследственная аллергия</Text>
          <Switch
            value={heredity}
            onValueChange={setHeredity}
            disabled={isSubmitting || isLogoutSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={isSubmitting || isLogoutSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Сохранить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            isLogoutSubmitting && styles.buttonDisabled,
          ]}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={isSubmitting || isLogoutSubmitting}
        >
          {isLogoutSubmitting ? (
            <ActivityIndicator color="#E63946" />
          ) : (
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
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
    padding: 24,
    paddingBottom: 40,
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
    marginBottom: 6,
    color: '#233142',
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    color: '#344054',
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#101828',
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
    color: '#233142',
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
  },
  saveButton: {
    marginTop: 30,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FCEBED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#E63946',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});