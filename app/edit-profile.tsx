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

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  const [smoker, setSmoker] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [sports, setSports] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const profile = await getUserProfileApi();

      const fullName = profile?.fullName ?? '';
      const [first = '', last = ''] = fullName.split(' ');

      setFirstName(first);
      setLastName(last);

      setAge(profile?.age ? String(profile.age) : '');
      setWeight(profile?.weight ? String(profile.weight) : '');

      setSmoker(Boolean(profile?.smoker));
      setAlcohol(Boolean(profile?.alcohol));
      setSports(Boolean(profile?.sports));
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка загрузки профиля');
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
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Введите имя и фамилию');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        fullName: `${firstName} ${lastName}`, // ✅ FIX
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        smoker,
        alcohol,
        sports,
      };

      console.log('PROFILE SAVE:', payload);

      await updateUserProfileApi(payload);

      Alert.alert('Успешно', 'Профиль обновлён');
      router.back();
    } catch (e) {
      console.log('SAVE ERROR:', e);
      Alert.alert('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2F6690" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Редактировать профиль</Text>

        <Text style={styles.label}>Имя</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Фамилия</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Возраст</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />

        <Text style={styles.label}>Вес</Text>
        <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />

        <Text style={styles.section}>Образ жизни</Text>

        <View style={styles.row}>
          <Text>Курение</Text>
          <Switch value={smoker} onValueChange={setSmoker} />
        </View>

        <View style={styles.row}>
          <Text>Алкоголь</Text>
          <Switch value={alcohol} onValueChange={setAlcohol} />
        </View>

        <View style={styles.row}>
          <Text>Спорт</Text>
          <Switch value={sports} onValueChange={setSports} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FB' },
  container: { padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  back: { marginBottom: 10 },
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
    backgroundColor: '#2F6690',
    padding: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});