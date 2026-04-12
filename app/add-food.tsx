import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
  createFoodApi,
  getFoodCategoriesApi,
  searchFoodCatalogApi,
  updateFoodApi,
  type FoodCatalogItem,
  type FoodCategory,
} from '../src/api/diaryApi';
import { formStyles as styles } from '../src/styles/formStyles';

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
  const [isSearching, setIsSearching] = useState(false);
  const [catalogItems, setCatalogItems] = useState<FoodCatalogItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const data = await getFoodCategoriesApi();
        if (isMounted) {
          setCategories(data ?? []);
        }
      } catch {
        // категории не критичны для работы формы
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const trimmed = foodName.trim();

    if (!trimmed || trimmed.length < 2) {
      setCatalogItems([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        const data = await searchFoodCatalogApi(trimmed);
        if (isMounted) {
          setCatalogItems(data ?? []);
        }
      } catch {
        if (isMounted) {
          setCatalogItems([]);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [foodName]);

  const handleSelectCatalogItem = (item: FoodCatalogItem) => {
    setFoodName(item.name);

    if (!category.trim() && item.category) {
      setCategory(item.category);
    }

    setCatalogItems([]);
  };

  const handleSelectCategory = (item: FoodCategory) => {
    setCategory(item.name);
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

    let parsedAmount: number | undefined;
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
          {isEdit ? 'Редактировать питание' : 'Питание'}
        </Text>
        <Text style={styles.subtitle}>
          Найдите продукт через бэк или заполните запись вручную
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Поиск блюда</Text>
          <View
            style={{
              minHeight: 54,
              borderRadius: 16,
              backgroundColor: '#F8FAFC',
              borderWidth: 1,
              borderColor: '#E4E7EC',
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="search-outline" size={18} color="#98A2B3" />
            <TextInput
              style={{
                flex: 1,
                minHeight: 54,
                marginLeft: 10,
                color: '#101828',
                fontSize: 15,
              }}
              value={foodName}
              onChangeText={setFoodName}
              editable={!isSubmitting}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color="#2F6690" />
            ) : foodName.length > 0 ? (
              <TouchableOpacity
                onPress={() => {
                  setFoodName('');
                  setCatalogItems([]);
                }}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <Ionicons name="close-circle" size={18} color="#98A2B3" />
              </TouchableOpacity>
            ) : null}
          </View>

          {catalogItems.length > 0 && (
            <View
              style={{
                marginTop: 10,
                gap: 8,
              }}
            >
              {catalogItems.map((item) => (
                <TouchableOpacity
                  key={String(item.id)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#E4E7EC',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  activeOpacity={0.85}
                  onPress={() => handleSelectCatalogItem(item)}
                  disabled={isSubmitting}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: '#233142',
                      }}
                    >
                      {item.name}
                    </Text>
                    {!!item.category && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#98A2B3',
                          marginTop: 2,
                        }}
                      >
                        {item.category}
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#98A2B3"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {!!categories.length && (
            <>
              <Text style={styles.label}>Категории</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
              >
                {categories.map((item) => {
                  const active = category === item.name;

                  return (
                    <TouchableOpacity
                      key={String(item.id)}
                      style={{
                        height: 36,
                        borderRadius: 18,
                        paddingHorizontal: 14,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: active ? '#2F6690' : '#EAF1F7',
                        marginRight: 10,
                      }}
                      activeOpacity={0.85}
                      onPress={() => handleSelectCategory(item)}
                      disabled={isSubmitting}
                    >
                      <Text
                        style={{
                          color: active ? '#FFFFFF' : '#2F6690',
                          fontSize: 13,
                          fontWeight: '700',
                        }}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

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
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.half,
                {
                  minHeight: 48,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: !reactionOccurred ? '#2F6690' : '#D0D5DD',
                  backgroundColor: !reactionOccurred ? '#EAF1F7' : '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
              activeOpacity={0.85}
              onPress={() => setReactionOccurred(false)}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  color: !reactionOccurred ? '#2F6690' : '#344054',
                  fontSize: 15,
                  fontWeight: '600',
                }}
              >
                Нет
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.half,
                {
                  minHeight: 48,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: reactionOccurred ? '#2F6690' : '#D0D5DD',
                  backgroundColor: reactionOccurred ? '#EAF1F7' : '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
              activeOpacity={0.85}
              onPress={() => setReactionOccurred(true)}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  color: reactionOccurred ? '#2F6690' : '#344054',
                  fontSize: 15,
                  fontWeight: '600',
                }}
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
                multiline
                value={reactionDescription}
                onChangeText={setReactionDescription}
                editable={!isSubmitting}
              />
            </>
          )}

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