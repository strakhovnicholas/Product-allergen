import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

import { loginApi } from '../src/api/authApi';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginApi({
        email: email.trim(),
        password,
      });

      const token = res.accessToken;
      const refreshToken = res.refreshToken;

      if (!token || !refreshToken) {
        throw new Error('Токены не получены');
      }

      await login(token, refreshToken);

      router.replace('/(tabs)/diary');
    } catch (error) {
      Alert.alert(
        'Ошибка входа',
        error instanceof Error ? error.message : 'Неверные данные'
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
              <Ionicons name="log-in-outline" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Вход</Text>
            <Text style={styles.subtitle}>
              Войдите в аккаунт, чтобы продолжить
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Авторизация</Text>

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
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Войти</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.replace('/register')}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={styles.registerText}>У меня нет аккаунта</Text>
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
    backgroundColor: '#EEF4FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#EEF4FF',
  },
  scrollContent: {
    width: '100%',
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 48,
  },
  topBlock: {
    backgroundColor: '#1D4ED8',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 44,
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#78A6C8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF55',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
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
    marginTop: 14,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D7E3F4',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#101828',
    marginBottom: 16,
  },
  loginButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  registerButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#1D4ED8',
    fontSize: 16,
    fontWeight: '700',
  },
});