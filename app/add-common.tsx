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

import {
  createCommonFeelingApi,
  updateCommonFeelingApi,
} from '../src/api/diaryApi';
import { formStyles as styles } from '../src/styles/formStyles';

function isValidDateString(value: string) {
  if (!value.trim()) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function parseScore(value: string, fieldName: string): number | undefined {
  const normalized = value.trim();

  if (!normalized) return undefined;

  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    throw new Error(`Поле "${fieldName}" должно быть числом`);
  }

  if (parsed < 0 || parsed > 10) {
    throw new Error(`Поле "${fieldName}" должно быть в диапазоне от 0 до 10`);
  }

  return parsed;
}

export default function AddCommonScreen() {
  const params = useLocalSearchParams<{
    feelingId?: string;
    dateTime?: string;
    wellbeingScore?: string;
    mood?: string;
    energyLevel?: string;
    comment?: string;
  }>();

  const isEdit = useMemo(() => Boolean(params.feelingId), [params.feelingId]);

  const [dateTime, setDateTime] = useState(params.dateTime ?? '');
  const [wellbeing, setWellbeing] = useState(params.wellbeingScore ?? '');
  const [mood, setMood] = useState(params.mood ?? '');
  const [energyLevel, setEnergyLevel] = useState(params.energyLevel ?? '');
  const [comment, setComment] = useState(params.comment ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const normalizedDateTime = dateTime.trim();
    const normalizedComment = comment.trim();

    if (!normalizedDateTime || !wellbeing.trim()) {
      Alert.alert('Ошибка', 'Заполните дату и самочувствие');
      return;
    }

    if (!isValidDateString(normalizedDateTime)) {
      Alert.alert('Ошибка', 'Введите корректную дату и время');
      return;
    }

    try {
      const parsedWellbeing = parseScore(wellbeing, 'Самочувствие');
      const parsedMood = parseScore(mood, 'Настроение');
      const parsedEnergyLevel = parseScore(energyLevel, 'Энергия');

      if (parsedWellbeing === undefined) {
        Alert.alert('Ошибка', 'Укажите самочувствие');
        return;
      }

      const payload = {
        dateTime: normalizedDateTime,
        wellbeingScore: parsedWellbeing,
        mood: parsedMood,
        energyLevel: parsedEnergyLevel,
        comment: normalizedComment || undefined,
      };

      setIsSubmitting(true);

      if (isEdit && params.feelingId) {
        await updateCommonFeelingApi(params.feelingId, payload);
        Alert.alert('Успешно', 'Запись самочувствия обновлена');
      } else {
        await createCommonFeelingApi(payload);
        Alert.alert('Успешно', 'Запись сохранена');
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить запись'
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
          {isEdit ? 'Редактировать самочувствие' : 'Самочувствие'}
        </Text>
        <Text style={styles.subtitle}>Оцените своё состояние</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Дата и время</Text>
          <TextInput
            style={styles.input}
            value={dateTime}
            onChangeText={setDateTime}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Самочувствие (0-10)</Text>
          <TextInput
            style={styles.input}
            value={wellbeing}
            onChangeText={setWellbeing}
            keyboardType="numeric"
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Настроение (0-10)</Text>
          <TextInput
            style={styles.input}
            value={mood}
            onChangeText={setMood}
            keyboardType="numeric"
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Энергия (0-10)</Text>
          <TextInput
            style={styles.input}
            value={energyLevel}
            onChangeText={setEnergyLevel}
            keyboardType="numeric"
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Комментарий</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={comment}
            onChangeText={setComment}
            multiline
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