import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {
  createCommonFeelingApi,
  updateCommonFeelingApi,
} from '../src/api/diaryApi';

export default function AddCommonScreen() {
  const params = useLocalSearchParams<{
    feelingId?: string;
    dateTime?: string;
    wellbeingScore?: string;
    mood?: string;
    energyLevel?: string;
    comment?: string;
  }>();

  const isEdit = useMemo(() => !!params.feelingId, [params.feelingId]);

  const [dateTime, setDateTime] = useState(params.dateTime ?? '');
  const [wellbeingScore, setWellbeingScore] = useState(
    params.wellbeingScore ?? ''
  );
  const [mood, setMood] = useState(params.mood ?? '');
  const [energyLevel, setEnergyLevel] = useState(params.energyLevel ?? '');
  const [comment, setComment] = useState(params.comment ?? '');

  const handleSave = async () => {
    if (!dateTime.trim() || !wellbeingScore.trim()) {
      Alert.alert('Ошибка', 'Заполните дату и самочувствие');
      return;
    }

    const payload = {
      dateTime: dateTime.trim(),
      wellbeingScore: Number(wellbeingScore),
      mood: mood ? Number(mood) : undefined,
      energyLevel: energyLevel ? Number(energyLevel) : undefined,
      comment: comment.trim() || undefined,
    };

    try {
      if (isEdit && params.feelingId) {
        await updateCommonFeelingApi(params.feelingId, payload);
        Alert.alert('Успешно', 'Запись самочувствия обновлена');
      } else {
        await createCommonFeelingApi(payload);
        Alert.alert('Успешно', 'Самочувствие сохранено');
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить запись'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать самочувствие' : 'Добавить самочувствие'}
        </Text>

        <Text style={styles.label}>Дата и время</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-03-29T10:30:00"
          value={dateTime}
          onChangeText={setDateTime}
        />

        <Text style={styles.label}>Самочувствие (0-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="6"
          keyboardType="numeric"
          value={wellbeingScore}
          onChangeText={setWellbeingScore}
        />

        <Text style={styles.label}>Настроение (0-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="5"
          keyboardType="numeric"
          value={mood}
          onChangeText={setMood}
        />

        <Text style={styles.label}>Энергия (0-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="4"
          keyboardType="numeric"
          value={energyLevel}
          onChangeText={setEnergyLevel}
        />

        <Text style={styles.label}>Комментарий</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Комментарий"
          multiline
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>
            {isEdit ? 'Обновить' : 'Сохранить'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#233142', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#344054', marginBottom: 8, marginTop: 12 },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  button: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});