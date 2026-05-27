import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { registerApi } from '../src/api/authApi';

export default function RegisterScreen() {
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const resetErrors = () => {
    setFormError('');
    setEmailError('');
    setPasswordError('');
  };

  const applyBackendError = (message: string) => {
    const normalized = message.toLowerCase();
    if (normalized.includes('поле email') || normalized.includes('email')) {
      setEmailError(message);
      return;
    }
    if (normalized.includes('поле пароль') || normalized.includes('password') || normalized.includes('пароль')) {
      setPasswordError(message);
      return;
    }
    setFormError(message);
  };

  const handleNext = async () => {
    resetErrors();

    if (!email || !password || !confirm) {
      setFormError('Заполните все поля');
      return;
    }

    if (password !== confirm) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      const authRes = await registerApi({
        email: email.trim(),
        password,
      });

      if (!authRes.accessToken || !authRes.refreshToken) {
        throw new Error('Сервис авторизации не вернул токены');
      }

      router.push({
        pathname: '/profile-step-1',
        params: {
          accessToken: authRes.accessToken,
          refreshToken: authRes.refreshToken,
        },
      });
    } catch (e) {
      applyBackendError(
        e instanceof Error ? e.message : 'Проверьте email и пароль'
      );
    } finally {
      setLoading(false);
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.topBlock}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-add-outline" size={34} color="#fff" />
            </View>

            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.subtitle}>
              Шаг 1 из 3
            </Text>
          </View>

          <View style={styles.formCard}>
            {!!formError && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#B42318" />
                <Text style={styles.errorBannerText}>{formError}</Text>
              </View>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, !!emailError && styles.inputError]}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailError('');
                setFormError('');
              }}
              autoCapitalize="none"
            />
            {!!emailError && <Text style={styles.fieldErrorText}>{emailError}</Text>}

            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={[styles.input, !!passwordError && styles.inputError]}
              secureTextEntry
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError('');
                setFormError('');
              }}
            />
            {!!passwordError && <Text style={styles.fieldErrorText}>{passwordError}</Text>}

            <Text style={styles.label}>Повторите пароль</Text>
            <TextInput
              style={[styles.input, !!passwordError && styles.inputError]}
              secureTextEntry
              value={confirm}
              onChangeText={(value) => {
                setConfirm(value);
                setPasswordError('');
                setFormError('');
              }}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Далее</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.loginText}>
                У меня уже есть аккаунт
              </Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF4FF' },
  container: { flex: 1, backgroundColor: '#EEF4FF' },
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
    padding: 24,
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
    marginBottom: 16,
  },

  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    color: '#DCEAF5',
    marginTop: 8,
  },

  formCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 14,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  label: { marginBottom: 8, fontWeight: '600', color: '#1E293B' },

  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#D7E3F4',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputError: {
    borderColor: '#B42318',
    backgroundColor: '#FEF3F2',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    color: '#B42318',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  fieldErrorText: {
    marginTop: -10,
    marginBottom: 10,
    color: '#B42318',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  loginButton: {
    marginTop: 16,
    alignItems: 'center',
  },

  loginText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
});