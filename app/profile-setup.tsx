import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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

export default function ProfileSetup() {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(false);
  const [sport, setSport] = useState(false);
  const [heredity, setHeredity] = useState(false);

  const handleSave = () => {
    if (!fullName || !age || !weight || !height) {
      Alert.alert('Ошибка', 'Заполните все основные поля');
      return;
    }

    router.replace('/(tabs)' as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти из аккаунта?',
      [
        {
          text: 'Отмена',
          style: 'cancel',
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            router.replace('/auth' as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#233142" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Заполнение профиля</Text>
        <Text style={styles.subtitle}>
          Эти данные помогут анализировать симптомы и триггеры
        </Text>

        <Text style={styles.label}>ФИО</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите ФИО"
          placeholderTextColor="#98A2B3"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Возраст</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите возраст"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите вес"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите рост"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        <Text style={styles.section}>Образ жизни</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Курение</Text>
          <Switch value={smoking} onValueChange={setSmoking} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Алкоголь</Text>
          <Switch value={alcohol} onValueChange={setAlcohol} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Спорт</Text>
          <Switch value={sport} onValueChange={setSport} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Наследственная аллергия</Text>
          <Switch value={heredity} onValueChange={setHeredity} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveText}>Сохранить</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    color: '#233142',
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    color: '#344054',
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#101828',
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
    color: '#233142',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 15,
    color: '#233142',
  },
  saveButton: {
    marginTop: 30,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 14,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FCEBED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#E63946',
    fontSize: 16,
    fontWeight: '700',
  },
});