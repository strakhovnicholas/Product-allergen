import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { createFoodApi, updateFoodApi } from '../src/api/diaryApi';

type PresetFood = {
  name: string;
  aliases: string[];
  category?: string;
  unit?: string;
};

const PRESET_FOODS: PresetFood[] = [
  { name: 'Йогурт', aliases: ['йог', 'yogurt', 'yog'], category: 'DAIRY', unit: 'GRAM' },
  { name: 'Кефир', aliases: ['кеф', 'kefir'], category: 'DAIRY', unit: 'ML' },
  { name: 'Творог', aliases: ['твор', 'curd'], category: 'DAIRY', unit: 'GRAM' },
  { name: 'Овсяная каша', aliases: ['овс', 'каша', 'oat'], category: 'GRAINS', unit: 'GRAM' },
  { name: 'Куриный суп', aliases: ['кур', 'суп', 'chicken soup'], category: 'SOUP', unit: 'ML' },
  { name: 'Салат Цезарь', aliases: ['цез', 'caesar'], category: 'SALAD', unit: 'GRAM' },
  { name: 'Пицца', aliases: ['пиц', 'pizza'], category: 'FAST_FOOD', unit: 'GRAM' },
  { name: 'Борщ', aliases: ['бор', 'borsch'], category: 'SOUP', unit: 'ML' },
  { name: 'Яблоко', aliases: ['ябл', 'apple'], category: 'FRUIT', unit: 'GRAM' },
  { name: 'Банан', aliases: ['бан', 'banana'], category: 'FRUIT', unit: 'GRAM' },
  { name: 'Омлет', aliases: ['омл', 'omelet'], category: 'BREAKFAST', unit: 'GRAM' },
  { name: 'Гречка с курицей', aliases: ['греч', 'гр', 'buckwheat'], category: 'MAIN_DISH', unit: 'GRAM' },
];

function isValidDateString(value: string) {
  if (!value.trim()) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

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

  const isEdit = useMemo(() => Boolean(params.foodIntakeId), [params.foodIntakeId]);

  const [foodName, setFoodName] = useState(params.foodName ?? '');
  const [category, setCategory] = useState(params.category ?? '');
  const [amount, setAmount] = useState(params.amount ?? '');
  const [unit, setUnit] = useState(params.unit ?? '');
  const [intakeTime, setIntakeTime] = useState(params.intakeTime ?? '');
  const [reactionOccurred, setReactionOccurred] = useState(
    params.reactionOccurred === 'true'
  );
  const [reactionDescription, setReactionDescription] = useState(
    params.reactionDescription ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFoods = useMemo(() => {
    const query = foodName.trim().toLowerCase();

    if (!query) {
      return PRESET_FOODS.slice(0, 8);
    }

    return PRESET_FOODS.filter((item) => {
      const inName = item.name.toLowerCase().includes(query);
      const inAliases = item.aliases.some((alias) =>
        alias.toLowerCase().includes(query)
      );
      return inName || inAliases;
    }).slice(0, 8);
  }, [foodName]);

  const handleSelectPreset = (item: PresetFood) => {
    setFoodName(item.name);
    if (!category.trim() && item.category) {
      setCategory(item.category);
    }
    if (!unit.trim() && item.unit) {
      setUnit(item.unit);
    }
  };

  const handleSave = async () => {
    const normalizedFoodName = foodName.trim();
    const normalizedCategory = category.trim();
    const normalizedUnit = unit.trim();
    const normalizedIntakeTime = intakeTime.trim();
    const normalizedReactionDescription = reactionDescription.trim();

    if (!normalizedFoodName || !normalizedIntakeTime) {
      Alert.alert('Ошибка', 'Заполните название блюда и время приёма');
      return;
    }

    if (!isValidDateString(normalizedIntakeTime)) {
      Alert.alert('Ошибка', 'Введите корректное время приёма');
      return;
    }

    let parsedAmount: number | undefined = undefined;

    if (amount.trim()) {
      parsedAmount = Number(amount);
      if (Number.isNaN(parsedAmount)) {
        Alert.alert('Ошибка', 'Количество должно быть числом');
        return;
      }
      if (parsedAmount <= 0) {
        Alert.alert('Ошибка', 'Количество должно быть больше нуля');
        return;
      }
    }

    if (reactionOccurred && !normalizedReactionDescription) {
      Alert.alert('Ошибка', 'Опишите реакцию, если она была');
      return;
    }

    const payload = {
      foodName: normalizedFoodName,
      category: normalizedCategory || undefined,
      amount: parsedAmount,
      unit: normalizedUnit || undefined,
      intakeTime: normalizedIntakeTime,
      reactionOccurred,
      reactionDescription: normalizedReactionDescription || undefined,
    };

    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isEdit ? 'Редактировать питание' : 'Добавить питание'}
        </Text>
        <Text style={styles.subtitle}>
          Выберите готовое блюдо или заполните запись вручную
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Поиск блюда</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#98A2B3" />

            <TextInput
              style={styles.searchInput}
              value={foodName}
              onChangeText={setFoodName}
              editable={!isSubmitting}
            />

            {foodName.length > 0 && (
              <TouchableOpacity
                onPress={() => setFoodName('')}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Ionicons name="close-circle" size={20} color="#98A2B3" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.chipsWrap}>
            {filteredFoods.length > 0 ? (
              filteredFoods.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={styles.foodChip}
                  onPress={() => handleSelectPreset(item)}
                  activeOpacity={0.85}
                  disabled={isSubmitting}
                >
                  <Text style={styles.foodChipText}>{item.name}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Ничего не найдено</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Название блюда</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            editable={!isSubmitting}
          />

          <Text style={styles.label}>Категория</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            editable={!isSubmitting}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Количество</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
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

          <Text style={styles.label}>Была ли реакция</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !reactionOccurred && styles.toggleButtonActive,
              ]}
              onPress={() => setReactionOccurred(false)}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  !reactionOccurred && styles.toggleButtonTextActive,
                ]}
              >
                Нет
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                reactionOccurred && styles.toggleButtonActive,
              ]}
              onPress={() => setReactionOccurred(true)}
              activeOpacity={0.85}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  reactionOccurred && styles.toggleButtonTextActive,
                ]}
              >
                Да
              </Text>
            </TouchableOpacity>
          </View>

          {reactionOccurred && (
            <>
              <Text style={styles.label}>Описание реакции</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={reactionDescription}
                onChangeText={setReactionDescription}
                multiline
                editable={!isSubmitting}
              />
            </>
          )}

          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEdit ? 'Обновить запись' : 'Сохранить запись'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 12,
  },
  searchBox: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#101828',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  foodChip: {
    backgroundColor: '#EAF1F7',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  foodChipText: {
    color: '#2F6690',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: '#98A2B3',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#101828',
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  toggleButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#EAF1F7',
    borderColor: '#2F6690',
  },
  toggleButtonText: {
    color: '#344054',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: '#2F6690',
  },
  saveButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2F6690',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});