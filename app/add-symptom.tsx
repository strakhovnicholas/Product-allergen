import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AddSymptomScreen() {
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [possibleCause, setPossibleCause] = useState('');

  const handleSave = () => {
    if (!symptomName || !severity || !startTime || !endTime) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }

    Alert.alert('Успешно', 'Симптом добавлен (пока локально)');
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

        <Text style={styles.title}>Добавить симптом</Text>
        <Text style={styles.subtitle}>
          Заполните данные о симптоме, чтобы сохранить запись в дневнике
        </Text>

        <Text style={styles.label}>Название симптома</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: Насморк"
          placeholderTextColor="#98A2B3"
          value={symptomName}
          onChangeText={setSymptomName}
        />

        <Text style={styles.label}>Сила симптома (1-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 7"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={severity}
          onChangeText={setSeverity}
        />

        <Text style={styles.label}>Время начала</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 09:30"
          placeholderTextColor="#98A2B3"
          value={startTime}
          onChangeText={setStartTime}
        />

        <Text style={styles.label}>Время окончания</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 14:00"
          placeholderTextColor="#98A2B3"
          value={endTime}
          onChangeText={setEndTime}
        />

        <Text style={styles.label}>Возможная причина</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Например: Пыльца, молочный продукт, пыль"
          placeholderTextColor="#98A2B3"
          value={possibleCause}
          onChangeText={setPossibleCause}
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
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
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
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