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
  View,
} from 'react-native';

import { registerApi } from '../src/api/authApi';
import { saveProfileApi } from '../src/api/profileApi';
import { useAuth } from '../src/context/AuthContext';

export default function ProfileStep2() {
  const params = useLocalSearchParams();
  const { login } = useAuth();

  const [smoker, setSmoker] = useState<boolean | null>(null);
  const [alcohol, setAlcohol] = useState<boolean | null>(null);
  const [sports, setSports] = useState<boolean | null>(null);

  const [chronic, setChronic] = useState('');
  const [allergies, setAllergies] = useState('');

  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (smoker === null || alcohol === null || sports === null) {
      Alert.alert('Ошибка', 'Выберите все привычки');
      return;
    }

    setLoading(true);

    try {
      const authRes = await registerApi({
        email: params.email as string,
        password: params.password as string,
      });

      const token = authRes.accessToken || authRes.token;

      if (!token) {
        throw new Error('Нет токена');
      }

      await login(token);

      // ===== 2. PROFILE =====

      const fullName = `${params.firstName} ${params.lastName}`;

      const payload = {
        fullName,
        age: Number(params.age),
        weight: Number(params.weight),
        height: Number(params.height),

        smoker,
        alcohol,
        sports,

        chronicDiseases: chronic
          ? chronic.split(',').map(s => s.trim().toUpperCase())
          : [],

        allergies: allergies
          ? allergies.split(',').map(s => s.trim())
          : [],
      };

      console.log('PROFILE PAYLOAD:', payload);

      await saveProfileApi(payload);

      Alert.alert('Успешно', 'Регистрация завершена');

      router.replace('/(tabs)');
    } catch (e) {
      console.log('REGISTER ERROR:', e);

      Alert.alert(
        'Ошибка',
        e instanceof Error ? e.message : 'Ошибка регистрации'
      );
    } finally {
      setLoading(false);
    }
  };

  const SelectButton = ({ title, value, selected, onPress }: any) => (
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.topBlock}>
            <View style={styles.logoCircle}>
              <Ionicons name="medkit-outline" size={34} color="#fff" />
            </View>

            <Text style={styles.title}>Привычки</Text>
            <Text style={styles.subtitle}>Шаг 3 из 3</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Курение</Text>
            <View style={styles.row}>
              <SelectButton title="Да" value={true} selected={smoker} onPress={setSmoker} />
              <SelectButton title="Нет" value={false} selected={smoker} onPress={setSmoker} />
            </View>

            <Text style={styles.label}>Алкоголь</Text>
            <View style={styles.row}>
              <SelectButton title="Да" value={true} selected={alcohol} onPress={setAlcohol} />
              <SelectButton title="Нет" value={false} selected={alcohol} onPress={setAlcohol} />
            </View>

            <Text style={styles.label}>Спорт</Text>
            <View style={styles.row}>
              <SelectButton title="Да" value={true} selected={sports} onPress={setSports} />
              <SelectButton title="Нет" value={false} selected={sports} onPress={setSports} />
            </View>

            <Text style={styles.label}>Хронические болезни (через запятую)</Text>
            <TextInput
              style={styles.input}
              value={chronic}
              onChangeText={setChronic}
            />

            <Text style={styles.label}>Аллергии</Text>
            <TextInput
              style={styles.input}
              value={allergies}
              onChangeText={setAllergies}
            />

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
  safeArea: { flex: 1, backgroundColor: '#2F6690' },
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scrollContent: { flexGrow: 1 },

  topBlock: {
    backgroundColor: '#2F6690',
    padding: 24,
    alignItems: 'center',
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#4D7FA8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#DCEAF5', marginTop: 6 },

  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },

  label: { marginBottom: 8, fontWeight: '600' },

  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },

  select: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectActive: {
    backgroundColor: '#2F6690',
  },

  selectText: { color: '#2F6690', fontWeight: '600' },

  selectTextActive: { color: '#fff' },

  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: { color: '#fff', fontWeight: '700' },
});