import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../src/context/AuthContext';
import { validateEmail, validatePassword } from '../src/utils/validation';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      Alert.alert('Ошибка', emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Ошибка', passwordError);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace('/(tabs)' as any);
    } catch (error) {
      Alert.alert(
        'Ошибка входа',
        error instanceof Error ? error.message : 'Не удалось выполнить вход'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBlock}>
          <View style={styles.logoCircle}>
            <Ionicons name="leaf-outline" size={34} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>Allergy Tracker</Text>
          <Text style={styles.subtitle}>
            Контролируйте симптомы, лекарства и триггеры каждый день
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Вход</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isSubmitting}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Войти</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.replace('/register' as any)}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.registerText}>Создать аккаунт</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2F6690' },
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  topBlock: {
    backgroundColor: '#2F6690',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 44,
    alignItems: 'center',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#4D7FA8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF33',
  },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginBottom: 10 },
  subtitle: {
    color: '#DCEAF5',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  formTitle: { fontSize: 24, fontWeight: '700', color: '#233142', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#344054', marginBottom: 8 },
  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#101828',
    marginBottom: 16,
  },
  loginButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 6,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  registerButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: { color: '#2F6690', fontSize: 16, fontWeight: '700' },
});