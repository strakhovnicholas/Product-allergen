import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ProfileStep1() {
  const params = useLocalSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState(''); // 🔥 НОВОЕ
  const [gender, setGender] = useState('');

  const handleNext = () => {
    if (!firstName || !lastName) {
      Alert.alert('Ошибка', 'Введите имя и фамилию');
      return;
    }

    if (!age || !weight || !height) {
      Alert.alert('Ошибка', 'Введите возраст, вес и рост'); // 🔥 обновили
      return;
    }

    if (!gender) {
      Alert.alert('Ошибка', 'Выберите пол');
      return;
    }

    router.push({
      pathname: '/profile-step-2',
      params: {
        email: params.email,
        password: params.password,

        firstName,
        lastName,
        age,
        weight,
        height, // 🔥 ПРОКИНУЛИ
        gender,
      },
    });
  };

  const SelectButton = ({
    title,
    value,
    selected,
    onPress,
  }: any) => (
    <TouchableOpacity
      style={[
        styles.selectButton,
        selected === value && styles.selectButtonActive,
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBlock}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-outline" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>Данные пользователя</Text>
            <Text style={styles.stepText}>Шаг 2 из 3</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Имя</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

            <Text style={styles.label}>Фамилия</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

            <Text style={styles.label}>Возраст</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />

            <Text style={styles.label}>Вес (кг)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            {/* 🔥 НОВОЕ ПОЛЕ */}
            <Text style={styles.label}>Рост (см)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />

            <Text style={styles.label}>Пол</Text>

            <View style={styles.row}>
              <SelectButton
                title="Мужской"
                value="male"
                selected={gender}
                onPress={setGender}
              />

              <SelectButton
                title="Женский"
                value="female"
                selected={gender}
                onPress={setGender}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Далее</Text>
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

  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },

  stepText: {
    color: '#DCEAF5',
    marginTop: 6,
  },

  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },

  label: {
    marginBottom: 8,
    fontWeight: '600',
  },

  input: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  selectButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectButtonActive: {
    backgroundColor: '#2F6690',
  },

  selectText: {
    color: '#2F6690',
    fontWeight: '600',
  },

  selectTextActive: {
    color: '#FFFFFF',
  },

  button: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});