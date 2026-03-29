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

import { createMedicineApi, updateMedicineApi } from '../src/api/diaryApi';
import { formStyles as styles } from '../src/styles/formStyles';

function isValidDateString(value: string) {
  if (!value.trim()) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export default function AddMedicineScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    medicineName?: string;
    dosage?: string;
    unit?: string;
    intakeTime?: string;
    medicationType?: string;
    reason?: string;
  }>();

  const isEdit = useMemo(() => Boolean(params.id), [params.id]);

  const [medicineName, setMedicineName] = useState(params.medicineName ?? '');
  const [dosage, setDosage] = useState(params.dosage ?? '');
  const [unit, setUnit] = useState(params.unit ?? '');
  const [intakeTime, setIntakeTime] = useState(params.intakeTime ?? '');
  const [medicationType, setMedicationType] = useState(params.medicationType ?? '');
  const [reason, setReason] = useState(params.reason ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const normalizedMedicineName = medicineName.trim();
    const normalizedUnit = unit.trim();
    const normalizedIntakeTime = intakeTime.trim();
    const normalizedReason = reason.trim();

    if (!normalizedMedicineName || !normalizedIntakeTime) {
      Alert.alert('Ошибка', 'Заполните название и время приёма');
      return;
    }

    if (!isValidDateString(normalizedIntakeTime)) {
      Alert.alert('Ошибка', 'Введите корректное время приёма');
      return;
    }

    let parsedDosage: number | undefined = undefined;
    if (dosage.trim()) {
      parsedDosage = Number(dosage);
      if (Number.isNaN(parsedDosage)) {
        Alert.alert('Ошибка', 'Дозировка должна быть числом');
        return;
      }
      if (parsedDosage <= 0) {
        Alert.alert('Ошибка', 'Дозировка должна быть больше нуля');
        return;
      }
    }

    let parsedMedicationType: number | undefined = undefined;
    if (medicationType.trim()) {
      parsedMedicationType = Number(medicationType);
      if (Number.isNaN(parsedMedicationType)) {
        Alert.alert('Ошибка', 'Тип лекарства должен быть числом');
        return;
      }
      if (parsedMedicationType < 0) {
        Alert.alert('Ошибка', 'Тип лекарства не может быть отрицательным');
        return;
      }
    }

    const payload = {
      medicineName: normalizedMedicineName,
      dosage: parsedDosage,
      unit: normalizedUnit || undefined,
      intakeTime: normalizedIntakeTime,
      medicationType: parsedMedicationType,
      reason: normalizedReason || undefined,
    };

    setIsSubmitting(true);

    try {
      if (isEdit && params.id) {
        await updateMedicineApi(params.id, payload);
        Alert.alert('Успешно', 'Лекарство обновлено');
      } else {
        await createMedicineApi(payload);
        Alert.alert('Успешно', 'Лекарство сохранено');
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить лекарство'
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
          {isEdit ? 'Редактировать лекарство' : 'Лекарство'}
        </Text>
        <Text style={styles.subtitle}>Заполните данные о приёме лекарства</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Название</Text>
          <TextInput
            style={styles.input}
            value={medicineName}
            onChangeText={setMedicineName}
            editable={!isSubmitting}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Дозировка</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dosage}
                onChangeText={setDosage}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>Единица</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                editable={!isSubmitting}
              />
            </View>
          </View>

          <Text style={styles.label}>Время приёма</Text>
          <TextInput
            style={styles.input}
            value={intakeTime}
            onChangeText={setIntakeTime}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Тип лекарства</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={medicationType}
            onChangeText={setMedicationType}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Причина</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={reason}
            onChangeText={setReason}
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