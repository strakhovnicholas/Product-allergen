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

import { createMedicineApi, updateMedicineApi } from '../src/api/diaryApi';

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

  const isEdit = useMemo(() => !!params.id, [params.id]);

  const [medicineName, setMedicineName] = useState(params.medicineName ?? '');
  const [dosage, setDosage] = useState(params.dosage ?? '');
  const [unit, setUnit] = useState(params.unit ?? '');
  const [intakeTime, setIntakeTime] = useState(params.intakeTime ?? '');
  const [medicationType, setMedicationType] = useState(params.medicationType ?? '');
  const [reason, setReason] = useState(params.reason ?? '');

  const handleSave = async () => {
    if (!medicineName.trim() || !intakeTime.trim()) {
      Alert.alert('Ошибка', 'Заполните название и время приёма');
      return;
    }

    const payload = {
      medicineName: medicineName.trim(),
      dosage: dosage ? Number(dosage) : undefined,
      unit: unit.trim() || undefined,
      intakeTime: intakeTime.trim(),
      medicationType: medicationType ? Number(medicationType) : undefined,
      reason: reason.trim() || undefined,
    };

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
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать лекарство' : 'Добавить лекарство'}
        </Text>

        <Text style={styles.label}>Название</Text>
        <TextInput
          style={styles.input}
          placeholder="Цетрин"
          value={medicineName}
          onChangeText={setMedicineName}
        />

        <Text style={styles.label}>Дозировка</Text>
        <TextInput
          style={styles.input}
          placeholder="10"
          keyboardType="numeric"
          value={dosage}
          onChangeText={setDosage}
        />

        <Text style={styles.label}>Единица</Text>
        <TextInput
          style={styles.input}
          placeholder="MG"
          value={unit}
          onChangeText={setUnit}
        />

        <Text style={styles.label}>Время приёма</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-03-29T09:00:00"
          value={intakeTime}
          onChangeText={setIntakeTime}
        />

        <Text style={styles.label}>Тип лекарства</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          keyboardType="numeric"
          value={medicationType}
          onChangeText={setMedicationType}
        />

        <Text style={styles.label}>Причина</Text>
        <TextInput
          style={styles.input}
          placeholder="Аллергия"
          value={reason}
          onChangeText={setReason}
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