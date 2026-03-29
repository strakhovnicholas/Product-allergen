import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createSymptomApi, updateSymptomApi } from '../src/api/diaryApi';
import { formStyles as styles } from '../src/styles/formStyles';

function isValidDateString(value: string) {
  if (!value.trim()) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export default function AddSymptomScreen() {
  const params = useLocalSearchParams<{
    symptomsId?: string;
    symptomName?: string;
    severity?: string;
    startTime?: string;
    endTime?: string;
    possibleCause?: string;
  }>();

  const isEdit = useMemo(() => Boolean(params.symptomsId), [params.symptomsId]);

  const [symptomName, setSymptomName] = useState(params.symptomName ?? '');
  const [severity, setSeverity] = useState(params.severity ?? '');
  const [startTime, setStartTime] = useState(params.startTime ?? '');
  const [endTime, setEndTime] = useState(params.endTime ?? '');
  const [possibleCause, setPossibleCause] = useState(params.possibleCause ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const normalizedSymptomName = symptomName.trim();
    const normalizedStartTime = startTime.trim();
    const normalizedEndTime = endTime.trim();
    const normalizedPossibleCause = possibleCause.trim();

    if (!normalizedSymptomName || !severity.trim() || !normalizedStartTime) {
      Alert.alert('Ошибка', 'Заполните название, силу и время начала');
      return;
    }

    const severityNumber = Number(severity);

    if (Number.isNaN(severityNumber)) {
      Alert.alert('Ошибка', 'Сила симптома должна быть числом');
      return;
    }

    if (severityNumber < 1 || severityNumber > 10) {
      Alert.alert('Ошибка', 'Сила симптома должна быть от 1 до 10');
      return;
    }

    if (!isValidDateString(normalizedStartTime)) {
      Alert.alert('Ошибка', 'Введите корректное время начала');
      return;
    }

    if (normalizedEndTime && !isValidDateString(normalizedEndTime)) {
      Alert.alert('Ошибка', 'Введите корректное время окончания');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        symptomName: normalizedSymptomName,
        severity: severityNumber,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime || undefined,
        possibleCause: normalizedPossibleCause || undefined,
      };

      if (isEdit && params.symptomsId) {
        await updateSymptomApi(params.symptomsId, payload);
        Alert.alert('Успешно', 'Симптом обновлён');
      } else {
        await createSymptomApi(payload);
        Alert.alert('Успешно', 'Симптом сохранён');
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить симптом'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          {isEdit ? 'Редактировать симптом' : 'Симптом'}
        </Text>
        <Text style={styles.subtitle}>Заполните данные о симптоме</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Название симптома</Text>
          <TextInput
            style={styles.input}
            value={symptomName}
            onChangeText={setSymptomName}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Сила (1-10)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={severity}
            onChangeText={setSeverity}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Время начала</Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Время окончания</Text>
          <TextInput
            style={styles.input}
            value={endTime}
            onChangeText={setEndTime}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Предполагаемая причина</Text>
          <TextInput
            style={styles.input}
            value={possibleCause}
            onChangeText={setPossibleCause}
            editable={!isSubmitting}
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isEdit ? 'Обновить' : 'Сохранить'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}