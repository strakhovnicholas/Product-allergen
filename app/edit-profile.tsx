import { Ionicons } from '@expo/vector-icons';
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

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState('Михаил Киреев');
  const [email, setEmail] = useState('mikhail@example.com');
  const [age, setAge] = useState('21');
  const [weight, setWeight] = useState('72');
  const [height, setHeight] = useState('178');

  const [smoking, setSmoking] = useState(false);
  const [alcohol, setAlcohol] = useState(true);
  const [sport, setSport] = useState(true);
  const [heredity, setHeredity] = useState(true);

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#233142" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Редактировать профиль</Text>
        <Text style={styles.subtitle}>
          Измените основные данные и параметры образа жизни
        </Text>

        <Text style={styles.label}>ФИО</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Введите ФИО"
          placeholderTextColor="#98A2B3"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Введите email"
          placeholderTextColor="#98A2B3"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Возраст</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Введите возраст"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Введите вес"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="Введите рост"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>Образ жизни</Text>

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
          <Text style={styles.switchLabel}>Наследственность</Text>
          <Switch value={heredity} onValueChange={setHeredity} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Сохранить изменения</Text>
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
    padding: 20,
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
    color: '#233142',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#101828',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#233142',
    marginTop: 28,
    marginBottom: 14,
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
    fontWeight: '500',
  },
  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});