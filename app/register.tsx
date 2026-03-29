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
  View,
} from 'react-native';

import { useAuth } from '../src/context/AuthContext';
import {
  validateEmail,
  validateFullName,
  validatePassword,
} from '../src/utils/validation';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const normalizedEmail = email.trim();
    const normalizedFullName = fullName.trim();
    const normalizedConfirmPassword = confirmPassword.trim();

    if (normalizedFullName) {
      const fullNameError = validateFullName(normalizedFullName);
      if (fullNameError) {
        Alert.alert('Ошибка', fullNameError);
        return;
      }
    }

    const emailError = validateEmail(normalizedEmail);
    if (emailError) {
      Alert.alert('Ошибка', emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Ошибка', passwordError);
      return;
    }

    if (!normalizedConfirmPassword) {
      Alert.alert('Ошибка', 'Подтвердите пароль');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        email: normalizedEmail,
        password,
        fullName: normalizedFullName || undefined,
        country: 'RU',
        timezone: 'Europe/Moscow',
      });

      router.replace('/profile-setup' as any);
    } catch (error) {
      Alert.alert(
        'Ошибка регистрации',
        error instanceof Error ? error.message : 'Не удалось зарегистрироваться'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToLogin = () => {
    if (isSubmitting) return;
    router.replace('/login' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.topBlock}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add-outline" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.subtitle}>
              Создайте аккаунт, чтобы вести дневник симптомов и контролировать аллергию
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Создание аккаунта</Text>

            <Text style={styles.label}>ФИО</Text>
            <TextInput
              placeholder="Введите ФИО"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              editable={!isSubmitting}
              returnKeyType="next"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Введите email"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!isSubmitting}
              returnKeyType="next"
            />

            <Text style={styles.label}>Пароль</Text>
            <TextInput
              placeholder="Введите пароль"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              returnKeyType="next"
            />

            <Text style={styles.label}>Подтвердите пароль</Text>
            <TextInput
              placeholder="Повторите пароль"
              placeholderTextColor="#98A2B3"
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSubmitting}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            <TouchableOpacity
              style={[styles.registerButton, isSubmitting && styles.disabledButton]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.disabledSecondaryButton]}
              onPress={goToLogin}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              <Text style={styles.loginText}>У меня уже есть аккаунт</Text>
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
    backgroundColor: '#2F6690',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  scrollContent: {
    flexGrow: 1,
  },
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
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 8,
  },
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
  registerButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#2F6690',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  disabledSecondaryButton: {
    opacity: 0.7,
  },
});