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

export default function AddCommonScreen() {
  const [wellbeingScore, setWellbeingScore] = useState('');
  const [mood, setMood] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [comment, setComment] = useState('');

  const handleSave = () => {
    if (!wellbeingScore || !mood || !energyLevel) {
      Alert.alert('Ошибка', 'Заполните обязательные поля');
      return;
    }

    Alert.alert('Успешно', 'Запись о самочувствии добавлена');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#233142" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Добавить самочувствие</Text>
        <Text style={styles.subtitle}>Оцените текущее состояние и сохраните запись</Text>

        <Text style={styles.label}>Самочувствие (1-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 7"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={wellbeingScore}
          onChangeText={setWellbeingScore}
        />

        <Text style={styles.label}>Настроение (1-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 6"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={mood}
          onChangeText={setMood}
        />

        <Text style={styles.label}>Энергия (1-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="Например: 5"
          placeholderTextColor="#98A2B3"
          keyboardType="numeric"
          value={energyLevel}
          onChangeText={setEnergyLevel}
        />

        <Text style={styles.label}>Комментарий</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Например: чувствую слабость после еды"
          placeholderTextColor="#98A2B3"
          multiline
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FB' },
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  contentContainer: { padding: 20, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
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
  title: { fontSize: 28, fontWeight: '700', color: '#233142', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#667085', lineHeight: 20, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#344054', marginBottom: 8, marginTop: 12 },
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
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});