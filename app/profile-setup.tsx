import { router } from 'expo-router';
import { useState } from 'react';
import {
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
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Заполнение профиля</Text>
        <Text style={styles.subtitle}>
          Эти данные помогут анализировать симптомы и триггеры
        </Text>

        <Text style={styles.label}>ФИО</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите ФИО"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Возраст</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите возраст"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите вес"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите рост"
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Сохранить</Text>
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
    padding: 24,
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
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },

  section: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  switchLabel: {
    fontSize: 15,
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
});