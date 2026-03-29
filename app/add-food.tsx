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

import { createFoodApi, updateFoodApi } from '../src/api/diaryApi';

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{
    foodIntakeId?: string;
    foodName?: string;
    category?: string;
    amount?: string;
    unit?: string;
    intakeTime?: string;
    reactionOccurred?: string;
    reactionDescription?: string;
  }>();

  const isEdit = useMemo(() => !!params.foodIntakeId, [params.foodIntakeId]);

  const [foodName, setFoodName] = useState(params.foodName ?? '');
  const [category, setCategory] = useState(params.category ?? '');
  const [amount, setAmount] = useState(params.amount ?? '');
  const [unit, setUnit] = useState(params.unit ?? '');
  const [intakeTime, setIntakeTime] = useState(params.intakeTime ?? '');
  const [reactionOccurred, setReactionOccurred] = useState(
    params.reactionOccurred ?? ''
  );
  const [reactionDescription, setReactionDescription] = useState(
    params.reactionDescription ?? ''
  );

  const handleSave = async () => {
    if (!foodName.trim() || !intakeTime.trim()) {
      Alert.alert('Ошибка', 'Заполните название блюда и время');
      return;
    }

    const payload = {
      foodName: foodName.trim(),
      category: category.trim() || undefined,
      amount: amount ? Number(amount) : undefined,
      unit: unit.trim() || undefined,
      intakeTime: intakeTime.trim(),
      reactionOccurred:
        reactionOccurred.trim().toLowerCase() === 'true' ||
        reactionOccurred.trim().toLowerCase() === 'да',
      reactionDescription: reactionDescription.trim() || undefined,
    };

    try {
      if (isEdit && params.foodIntakeId) {
        await updateFoodApi(params.foodIntakeId, payload);
        Alert.alert('Успешно', 'Запись о еде обновлена');
      } else {
        await createFoodApi(payload);
        Alert.alert('Успешно', 'Запись о еде сохранена');
      }

      router.back();
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сохранить запись о еде'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать еду' : 'Добавить еду'}
        </Text>

        <Text style={styles.label}>Название блюда</Text>
        <TextInput
          style={styles.input}
          placeholder="Йогурт"
          value={foodName}
          onChangeText={setFoodName}
        />

        <Text style={styles.label}>Категория</Text>
        <TextInput
          style={styles.input}
          placeholder="DAIRY"
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>Количество</Text>
        <TextInput
          style={styles.input}
          placeholder="150"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Единица</Text>
        <TextInput
          style={styles.input}
          placeholder="GRAM"
          value={unit}
          onChangeText={setUnit}
        />

        <Text style={styles.label}>Время приёма</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-03-29T08:30:00"
          value={intakeTime}
          onChangeText={setIntakeTime}
        />

        <Text style={styles.label}>Была реакция</Text>
        <TextInput
          style={styles.input}
          placeholder="true / false"
          value={reactionOccurred}
          onChangeText={setReactionOccurred}
        />

        <Text style={styles.label}>Описание реакции</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Зуд в горле"
          multiline
          value={reactionDescription}
          onChangeText={setReactionDescription}
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