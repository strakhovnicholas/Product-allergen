import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { ApiRequestError } from '../src/api/client';

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

      const normalizedCountry =
        typeof profileSnapshot?.country === 'string' && profileSnapshot.country.trim()
          ? profileSnapshot.country.trim()
          : 'Не указан';

      const normalizedGender = String(profileSnapshot?.gender || '').toUpperCase();
      const normalizedPredisposition = String(profileSnapshot?.predisposition || '').toUpperCase();

      const ageValue = age ? Number(age) : Number(profileSnapshot?.age);
      const weightValue = weight ? Number(weight) : Number(profileSnapshot?.weight);
      const heightValue = height ? Number(height) : Number(profileSnapshot?.height);

      const payload: any = {
        fullName: `${firstName} ${lastName}`,
        // Backend validates a full DTO on PUT, so we keep required fields.
        country: normalizedCountry,
        gender: normalizedGender === 'FEMALE' ? 'FEMALE' : 'MALE',
        predisposition:
          normalizedPredisposition === 'LOW' ||
          normalizedPredisposition === 'MEDIUM' ||
          normalizedPredisposition === 'HIGH'
            ? normalizedPredisposition
            : 'NONE',
        chronicDiseases: Array.isArray(profileSnapshot?.chronicDiseases)
          ? profileSnapshot.chronicDiseases
          : [],
        allergies: Array.isArray(profileSnapshot?.allergies)
          ? profileSnapshot.allergies
          : [],
        medicationsRegular: Array.isArray(profileSnapshot?.medicationsRegular)
          ? profileSnapshot.medicationsRegular
          : [],
        doctorNotes: typeof profileSnapshot?.doctorNotes === 'string'
          ? profileSnapshot.doctorNotes
          : '',
        smoker,
        alcohol,
        sports,
      };

      if (Number.isFinite(ageValue)) payload.age = ageValue;
      if (Number.isFinite(weightValue)) payload.weight = weightValue;
      if (Number.isFinite(heightValue)) payload.height = heightValue;

      console.log('SAVE PAYLOAD:', payload);

      const profileUserId =
        typeof profileSnapshot?.userId === 'string' && profileSnapshot.userId.trim()
          ? profileSnapshot.userId.trim()
          : undefined;

      await updateUserProfileApi(payload, profileUserId);

      Alert.alert('Успешно', 'Профиль обновлён');

      router.back();
    } catch (e) {
      console.log('SAVE ERROR:', e);
      if (e instanceof ApiRequestError) {
        console.log('SAVE ERROR RAW BODY:', e.rawBody);
        Alert.alert('Ошибка сохранения', e.message);
      } else {
        Alert.alert('Ошибка сохранения', e instanceof Error ? e.message : 'Проверьте введенные данные');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.overlay}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.modalWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.title}>Изменить профиль</Text>
              <Text style={styles.subtitle}>Изменения применятся сразу после сохранения</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="close" size={18} color="#334155" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Имя</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Фамилия</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

            <View style={styles.rowSplit}>
              <View style={styles.rowSplitCell}>
                <Text style={styles.label}>Возраст</Text>
                <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
              </View>
              <View style={styles.rowSplitCell}>
                <Text style={styles.label}>Вес (кг)</Text>
                <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
              </View>
            </View>

            <Text style={styles.label}>Рост (см)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />

            <Text style={styles.section}>Образ жизни</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Курение</Text>
              <Switch value={smoker} onValueChange={setSmoker} />
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Алкоголь</Text>
              <Switch value={alcohol} onValueChange={setAlcohol} />
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Спорт</Text>
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
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A99',
  },
  modalWrap: {
    width: '100%',
    paddingHorizontal: 14,
    maxWidth: 560,
    alignSelf: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    maxHeight: '88%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  modalTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  subtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B' },
  label: { marginBottom: 6, fontWeight: '600', color: '#334155' },
  input: {
    borderWidth: 1,
    borderColor: '#DDE4EE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: '#0F172A',
    backgroundColor: '#F8FBFF',
  },
  section: {
    marginTop: 8,
    marginBottom: 10,
    fontWeight: '700',
    fontSize: 16,
    color: '#1E293B',
  },
  rowSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  rowSplitCell: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6ECF4',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FBFF',
  },
  rowLabel: {
    color: '#334155',
    fontWeight: '600',
  },
  button: {
    marginTop: 18,
    backgroundColor: '#1D4ED8',
    padding: 14,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});