import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { nowAppDateTimeString } from '../src/utils/datetime';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createFoodApi,
  searchFoodCatalogApi,
  updateFoodApi,
} from '../src/api/diaryApi';
import { TOP_FOOD_CATALOG } from '../src/constants/foodCatalog';

import { formStyles as styles } from '../src/styles/formStyles';

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{
    foodIntakeId?: string;
    foodName?: string;
    category?: string;
    amount?: string;
    unit?: string;
    reactionOccurred?: string;
    reactionDescription?: string;
    components?: string;
  }>();

  const isEdit = useMemo(
    () => Boolean(params.foodIntakeId),
    [params.foodIntakeId]
  );

  // ===== STATE =====
  const [foodList, setFoodList] = useState<
    { foodName: string; category?: string; components?: string[] }[]
  >([]);
  const [mealTitle, setMealTitle] = useState(params.foodName ?? '');
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<
    { foodName: string; category?: string; components?: string[] }[]
  >([]);

  const [amount, setAmount] = useState(params.amount ?? '1');
  const [unit, setUnit] = useState(params.unit ?? 'GRAM');
  const [category, setCategory] = useState(params.category ?? 'OTHER');

  const [reaction, setReaction] = useState(params.reactionOccurred === 'true');
  const [reactionText, setReactionText] = useState(params.reactionDescription ?? '');

  const [components, setComponents] = useState<string[]>(
    params.components ? params.components.split('||').filter(Boolean) : []
  );
  const [componentInput, setComponentInput] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const mergeUnique = (items: string[]) =>
    Array.from(
      new Set(items.map((item) => item.trim()).filter(Boolean))
    );

  const normalizeCategory = (value?: string) => {
    const normalized = (value ?? '').toUpperCase();
    const allowed = new Set([
      'FRUIT',
      'VEGETABLE',
      'MEAT',
      'FISH',
      'DAIRY',
      'GRAINS',
      'NUTS',
      'LEGUMES',
      'FAST_FOOD',
      'BEVERAGES',
      'SWEETS',
      'GARNISH',
      'SOUP',
      'OTHER',
    ]);
    return allowed.has(normalized) ? normalized : 'OTHER';
  };

  const deriveCategoryFromProducts = (
    products: { category?: string }[]
  ) => {
    const categories = Array.from(
      new Set(products.map((item) => normalizeCategory(item.category)))
    );
    if (categories.length === 1) {
      return categories[0];
    }
    return 'OTHER';
  };

  // ===== LOAD FOOD =====
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const query = search.trim();
      if (!query) {
        setFoodList(TOP_FOOD_CATALOG.slice(0, 20));
        return;
      }

      setLoadingSuggestions(true);
      try {
        const [apiItems, localItems] = await Promise.all([
          searchFoodCatalogApi(query).catch(() => []),
          Promise.resolve(
            TOP_FOOD_CATALOG.filter((item) =>
              item.foodName.toLowerCase().includes(query.toLowerCase())
            )
          ),
        ]);

        const merged = [...apiItems, ...localItems];
        const deduped = Array.from(
          new Map(
            merged.map((item) => [item.foodName.toLowerCase(), item])
          ).values()
        ).slice(0, 30);

        if (!cancelled) {
          setFoodList(deduped);
        }
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  // ===== FILTER =====
  const filtered = useMemo(() => foodList, [foodList]);

  // ===== COMPONENTS =====
  const addComponent = () => {
    const value = componentInput.trim();
    if (!value) return;

    setComponents((prev) => [...prev, value]);
    setComponentInput('');
  };

  const removeComponent = (index: number) => {
    setComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const addProductToMeal = (item: {
    foodName: string;
    category?: string;
    components?: string[];
  }) => {
    setSelectedProducts((prev) => {
      if (prev.some((p) => p.foodName.toLowerCase() === item.foodName.toLowerCase())) {
        return prev;
      }
      const next = [...prev, item];
      setCategory(deriveCategoryFromProducts(next));
      return next;
    });

    setComponents((prev) => mergeUnique([...prev, ...(item.components ?? [])]));
    setSearch('');
    setShowDropdown(false);
  };

  const removeProductFromMeal = (foodName: string) => {
    setSelectedProducts((prev) => {
      const next = prev.filter((item) => item.foodName !== foodName);
      setCategory(next.length ? deriveCategoryFromProducts(next) : 'OTHER');
      return next;
    });
  };

  // ===== UNIT MAP =====
  const mapUnit = (u: string) => {
    switch (u) {
      case 'GRAM':
        return 'GRAM';
      case 'PORTION':
        return 'PORTION';
      case 'PIECE':
        return 'PIECE';
      case 'ML':
        return 'MILLILITER';
      default:
        return 'GRAM';
    }
  };

  // ===== SAVE =====
  const handleSave = async () => {
    console.log('[FOOD] save tapped');
    const nameFromProducts = selectedProducts.map((item) => item.foodName).join(' + ');
    const name = mealTitle.trim() || nameFromProducts;

    if (!name) {
      Alert.alert('Ошибка', 'Введите название блюда');
      return;
    }

    const parsedAmount = Number(amount || '1');
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Ошибка', 'Введите корректное количество (больше 0)');
      return;
    }

    const payload = {
      foodName: name,
      category: normalizeCategory(category),
      amount: parsedAmount,
      unit: mapUnit(unit),
      intakeTime: nowAppDateTimeString(),
      reactionOccurred: reaction,
      reactionDescription: reaction ? reactionText : '',
      components: components,
    };
    console.log('[FOOD] payload', payload);

    setIsSubmitting(true);

    try {
      if (isEdit && params.foodIntakeId) {
        await updateFoodApi(params.foodIntakeId, payload);
      } else {
        await createFoodApi(payload);
      }

      console.log('[FOOD] save success');
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось сохранить питание';
      console.log('[FOOD] save failed', message);
      Alert.alert('Ошибка сохранения', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>
          {isEdit ? 'Редактировать питание' : 'Питание'}
        </Text>

        <View style={styles.card}>
          <View style={ui.sectionCard}>
            <View style={ui.sectionHead}>
              <Ionicons name="restaurant-outline" size={18} color="#1D4ED8" />
              <Text style={ui.sectionHeadText}>Блюдо и продукты</Text>
            </View>
            <Text style={styles.label}>Название блюда</Text>
            <TextInput
              style={styles.input}
              value={mealTitle}
              onChangeText={setMealTitle}
              placeholder="Например: Завтрак / Салат / Смузи"
            />

            <Text style={styles.label}>Добавить продукт в приём пищи</Text>
            <TextInput
              style={styles.input}
              value={search}
              onChangeText={(t) => {
                setSearch(t);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Например: огурец, сок апельсиновый..."
            />
          </View>

          {showDropdown && (
            <View style={searchStyles.dropdown}>
              <ScrollView style={{ maxHeight: 150 }}>
                {filtered.length > 0 ? (
                  filtered.map((item) => (
                    <TouchableOpacity
                      key={item.foodName}
                      style={searchStyles.item}
                      onPress={() => addProductToMeal(item)}
                    >
                      <Text style={searchStyles.itemTitle}>{item.foodName}</Text>
                      {!!item.components?.length && (
                        <Text style={searchStyles.itemSubtitle} numberOfLines={1}>
                          {item.components.join(', ')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={searchStyles.empty}>
                    Ничего не найдено
                  </Text>
                )}
                {loadingSuggestions && (
                  <ActivityIndicator style={{ marginVertical: 8 }} />
                )}
              </ScrollView>
            </View>
          )}

          {!!selectedProducts.length && (
            <>
              <Text style={styles.label}>Продукты в этом приёме</Text>
              <View style={compStyles.wrap}>
                {selectedProducts.map((item) => (
                  <View key={item.foodName} style={compStyles.tag}>
                    <Text style={compStyles.tagText}>{item.foodName}</Text>
                    <TouchableOpacity onPress={() => removeProductFromMeal(item.foodName)}>
                      <Text style={compStyles.remove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={ui.sectionCard}>
            <View style={ui.sectionHead}>
              <Ionicons name="scale-outline" size={18} color="#1D4ED8" />
              <Text style={ui.sectionHeadText}>Количество</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="Например: 200"
              />

              <View style={unitStyles.container}>
                {[
                  { label: 'г', value: 'GRAM' },
                  { label: 'порц', value: 'PORTION' },
                  { label: 'шт', value: 'PIECE' },
                  { label: 'мл', value: 'ML' },
                ].map((u) => (
                  <TouchableOpacity
                    key={u.value}
                    style={[
                      unitStyles.item,
                      unit === u.value && unitStyles.active,
                    ]}
                    onPress={() => setUnit(u.value)}
                  >
                    <Text style={unit === u.value && { color: '#fff' }}>
                      {u.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={ui.sectionCard}>
            <View style={ui.sectionHead}>
              <Ionicons name="list-outline" size={18} color="#1D4ED8" />
              <Text style={ui.sectionHeadText}>Состав блюда</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={componentInput}
                onChangeText={setComponentInput}
                placeholder="Ингредиент..."
              />

              <TouchableOpacity
                onPress={addComponent}
                style={compStyles.addBtn}
              >
                <Text style={{ color: '#fff' }}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={compStyles.wrap}>
              {components.map((item, index) => (
                <View key={index} style={compStyles.tag}>
                  <Text style={compStyles.tagText}>{item}</Text>
                  <TouchableOpacity
                    onPress={() => removeComponent(index)}
                  >
                    <Text style={compStyles.remove}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={ui.sectionCard}>
            <View style={ui.sectionHead}>
              <Ionicons name="warning-outline" size={18} color="#1D4ED8" />
              <Text style={ui.sectionHeadText}>Реакция</Text>
            </View>
            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
              <TouchableOpacity
                style={[
                  toggleStyles.btn,
                  reaction && toggleStyles.active,
                ]}
                onPress={() => setReaction(true)}
              >
                <Text style={[toggleStyles.btnText, reaction && toggleStyles.btnTextActive]}>Да</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  toggleStyles.btn,
                  !reaction && toggleStyles.active,
                ]}
                onPress={() => setReaction(false)}
              >
                <Text style={[toggleStyles.btnText, !reaction && toggleStyles.btnTextActive]}>Нет</Text>
              </TouchableOpacity>
            </View>

            {reaction && (
              <TextInput
                style={[styles.input, styles.multiline]}
                value={reactionText}
                onChangeText={setReactionText}
                placeholder="Опишите реакцию"
                multiline
              />
            )}
          </View>

          {/* ===== SAVE ===== */}
          <TouchableOpacity
            style={[styles.button, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isEdit ? 'Обновить' : 'Сохранить'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenSafeArea>
  );
}

// ===== STYLES =====
const searchStyles = StyleSheet.create({
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  item: { padding: 12 },
  itemTitle: { fontSize: 14, color: '#233142', fontWeight: '600' },
  itemSubtitle: { marginTop: 4, fontSize: 12, color: '#667085' },
  empty: { padding: 12, color: '#999' },
});

const ui = StyleSheet.create({
  sectionCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E3F4',
    padding: 10,
    marginBottom: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionHeadText: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 14,
  },
});

const unitStyles = StyleSheet.create({
  container: { flexDirection: 'row' },
  item: {
    padding: 10,
    backgroundColor: '#DBEAFE',
    marginRight: 6,
    borderRadius: 10,
  },
  active: { backgroundColor: '#1D4ED8' },
});

const compStyles = StyleSheet.create({
  addBtn: {
    marginLeft: 8,
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D6E4FF',
    marginRight: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  tagText: { color: '#1D4ED8', fontWeight: '600' },
  remove: { marginLeft: 6, color: '#E11D48' },
});

const toggleStyles = StyleSheet.create({
  btn: {
    paddingHorizontal: 20,
    height: 42,
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
    marginRight: 8,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#D6E4FF',
  },
  active: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  btnText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  btnTextActive: {
    color: '#fff',
  },
});