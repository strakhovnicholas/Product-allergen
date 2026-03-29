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

import { createSymptomApi, updateSymptomApi } from '../src/api/diaryApi';

export default function AddSymptomScreen() {
  const params = useLocalSearchParams<{
    symptomsId?: string;
    symptomName?: string;
    severity?: string;
    startTime?: string;
    endTime?: string;
    possibleCause?: string;
  }>();

  const isEdit = useMemo(() => !!params.symptomsId, [params.symptomsId]);

  const [symptomName, setSymptomName] = useState(params.symptomName ?? '');
  const [severity, setSeverity] = useState(params.severity ?? '');
  const [startTime, setStartTime] = useState(params.startTime ?? '');
  const [endTime, setEndTime] = useState(params.endTime ?? '');
  const [possibleCause, setPossibleCause] = useState(params.possibleCause ?? '');

  const handleSave = async () => {
    if (!symptomName.trim() || !severity.trim() || !startTime.trim()) {
      Alert.alert('Ошибка', 'Заполните название, силу и время начала');
      return;
    }

    try {
      if (isEdit && params.symptomsId) {
        await updateSymptomApi({
          symptomsId: params.symptomsId,
          symptomName: symptomName.trim(),
          severity: Number(severity),
          startTime: startTime.trim(),
          endTime: endTime.trim() || undefined,
          possibleCause: possibleCause.trim() || undefined,
        });

        Alert.alert('Успешно', 'Симптом обновлён');
      } else {
        await createSymptomApi({
          symptomName: symptomName.trim(),
          severity: Number(severity),
          startTime: startTime.trim(),
          endTime: endTime.trim() || undefined,
          possibleCause: possibleCause.trim() || undefined,
        });

        Alert.alert('Успешно', 'Симптом сохранён');
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить симптом'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать симптом' : 'Добавить симптом'}
        </Text>

        <Text style={styles.label}>Название симптома</Text>
        <TextInput
          style={styles.input}
          placeholder="Насморк"
          value={symptomName}
          onChangeText={setSymptomName}
        />

        <Text style={styles.label}>Сила (1-10)</Text>
        <TextInput
          style={styles.input}
          placeholder="8"
          keyboardType="numeric"
          value={severity}
          onChangeText={setSeverity}
        />

        <Text style={styles.label}>Время начала</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-03-29T09:30:00"
          value={startTime}
          onChangeText={setStartTime}
        />

        <Text style={styles.label}>Время окончания</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-03-29T14:00:00"
          value={endTime}
          onChangeText={setEndTime}
        />

        <Text style={styles.label}>Предполагаемая причина</Text>
        <TextInput
          style={styles.input}
          placeholder="Пыльца"
          value={possibleCause}
          onChangeText={setPossibleCause}
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