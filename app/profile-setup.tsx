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

import { updateUserProfileApi } from '../src/api/profileApi';
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

      const payload = {
        fullName: normalizedFullName,
        age: parsedAge,
        weight: parsedWeight,
        height: parsedHeight,
        smoker: smoking,     // ✅ FIX
        alcohol,
        sports: sport,       // ✅ FIX
      };

      console.log('PROFILE CREATE:', payload);

      await updateUserProfileApi(payload); // ✅ используем PUT

      Alert.alert('Успешно', 'Профиль сохранён');
      router.replace('/(tabs)/diary' as any);
    } catch (error) {
      console.log('PROFILE ERROR:', error);
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
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLogoutSubmitting(true);
            await logout();
            router.replace('/login' as any);
          } catch {
            Alert.alert('Ошибка', 'Не удалось выйти');
          } finally {
            setIsLogoutSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Заполнение профиля</Text>

        <Text style={styles.label}>ФИО</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Возраст</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />

        <Text style={styles.label}>Вес</Text>
        <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />

        <Text style={styles.label}>Рост</Text>
        <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />

        <Text style={styles.section}>Образ жизни</Text>

        <View style={styles.row}>
          <Text>Курение</Text>
          <Switch value={smoking} onValueChange={setSmoking} />
        </View>

        <View style={styles.row}>
          <Text>Алкоголь</Text>
          <Switch value={alcohol} onValueChange={setAlcohol} />
        </View>

        <View style={styles.row}>
          <Text>Спорт</Text>
          <Switch value={sport} onValueChange={setSport} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Сохранить</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {isLogoutSubmitting ? (
            <ActivityIndicator color="#E11D48" />
          ) : (
            <Text style={styles.logoutText}>Выйти</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF4FF' },
  contentContainer: { padding: 20 },

  backButton: { marginBottom: 10 },

  title: { fontSize: 26, fontWeight: '700', marginBottom: 20 },

  label: { marginBottom: 6, fontWeight: '600' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  section: { marginTop: 20, marginBottom: 10, fontWeight: '700' },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },

  button: {
    marginTop: 20,
    backgroundColor: '#1D4ED8',
    padding: 14,
    borderRadius: 12,
  },

  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },

  logoutButton: {
    marginTop: 12,
    backgroundColor: '#FCEBED',
    padding: 14,
    borderRadius: 12,
  },

  logoutText: { color: '#E11D48', textAlign: 'center', fontWeight: '700' },
});