import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    router.push({
      pathname: '/profile-step-1',
      params: { email, password },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.topBlock}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add-outline" size={34} color="#fff" />
            </View>
            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.subtitle}>Шаг 1 из 3</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />

            <Text style={styles.label}>Пароль</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

            <Text style={styles.label}>Повторите пароль</Text>
            <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Далее</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/login')}>
              <Text style={styles.loginText}>У меня есть аккаунт</Text>
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
  topBlock: { backgroundColor: '#2F6690', padding: 24, alignItems: 'center' },
  logoCircle: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#4D7FA8', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { color: '#fff', fontSize: 26, fontWeight: '700' },
  subtitle: { color: '#DCEAF5', marginTop: 6 },
  formCard: { flex: 1, backgroundColor: '#fff', marginTop: -18, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  label: { marginBottom: 8, fontWeight: '600' },
  input: { height: 54, borderRadius: 16, backgroundColor: '#F5F7FB', borderWidth: 1, borderColor: '#E4E7EC', paddingHorizontal: 16, marginBottom: 16 },
  button: { height: 54, borderRadius: 16, backgroundColor: '#2F6690', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  loginButton: { height: 54, borderRadius: 16, backgroundColor: '#EAF1F7', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: '#2F6690', fontWeight: '700' },
});