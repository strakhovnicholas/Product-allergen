import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

import {
  createFoodApi,
  getFoodApi,
  updateFoodApi,
} from '../src/api/diaryApi';

import { formStyles as styles } from '../src/styles/formStyles';

export default function AddFoodScreen() {
  const params = useLocalSearchParams<{
    foodIntakeId?: string;
    foodName?: string;
    amount?: string;
    unit?: string;
  }>();

  const isEdit = useMemo(
    () => Boolean(params.foodIntakeId),
    [params.foodIntakeId]
  );

  // ===== STATE =====
  const [foodList, setFoodList] = useState<string[]>([]);
  const [search, setSearch] = useState(params.foodName ?? '');
  const [selectedFood, setSelectedFood] = useState(
    params.foodName ?? ''
  );

  const [amount, setAmount] = useState(params.amount ?? '');
  const [unit, setUnit] = useState(params.unit ?? 'GRAM');

  const [reaction, setReaction] = useState(false);
  const [reactionText, setReactionText] = useState('');

  const [components, setComponents] = useState<string[]>([]);
  const [componentInput, setComponentInput] = useState('');

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== LOAD FOOD =====
  useEffect(() => {
    const load = async () => {
      try {
        const userId = 'test-user-id'; 

        const data = await getFoodApi();

        console.log('FOOD API:', data);

        const unique = [
          ...new Set(
            data?.map((i: any) => i.foodName).filter(Boolean)
          ),
        ];

        setFoodList(unique);
      } catch (e) {
        console.log('FOOD ERROR:', e);
      }
    };

    load();
  }, []);

  // ===== FILTER =====
  const filtered = useMemo(() => {
    if (!search.trim()) return foodList;

    return foodList.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, foodList]);

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
    const name = selectedFood || search.trim();

    if (!name) {
      Alert.alert('Ошибка', 'Введите название блюда');
      return;
    }

    const parsedAmount = Number(amount);

    const payload = {
      foodName: name,
      amount: !Number.isNaN(parsedAmount) ? parsedAmount : undefined,
      unit: mapUnit(unit),
      intakeTime: new Date().toISOString(),
      reactionOccurred: reaction,
      reactionDescription: reaction ? reactionText : '',
      components: components,
    };

    console.log('PAYLOAD:', payload);

    setIsSubmitting(true);

    try {
      if (isEdit && params.foodIntakeId) {
        await updateFoodApi(params.foodIntakeId, payload);
      } else {
        await createFoodApi(payload);
      }

      router.back();
    } catch (e: any) {
      console.log('SAVE ERROR:', e?.message || e);
      Alert.alert('Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать питание' : 'Питание'}
        </Text>

        <View style={styles.card}>
          {/* ===== ПОИСК ===== */}
          <Text style={styles.label}>Блюдо</Text>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Введите блюдо..."
          />

          {showDropdown && (
            <View style={searchStyles.dropdown}>
              <ScrollView style={{ maxHeight: 150 }}>
                {filtered.length > 0 ? (
                  filtered.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={searchStyles.item}
                      onPress={() => {
                        setSelectedFood(item);
                        setSearch(item);
                        setShowDropdown(false);
                      }}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={searchStyles.empty}>
                    Ничего не найдено
                  </Text>
                )}
              </ScrollView>
            </View>
          )}

          {/* ===== КОЛИЧЕСТВО ===== */}
          <Text style={styles.label}>Количество</Text>

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

          {/* ===== СОСТАВ ===== */}
          <Text style={styles.label}>Состав блюда</Text>

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
                <Text>{item}</Text>
                <TouchableOpacity
                  onPress={() => removeComponent(index)}
                >
                  <Text style={compStyles.remove}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* ===== РЕАКЦИЯ ===== */}
          <Text style={styles.label}>Была реакция?</Text>

          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <TouchableOpacity
              style={[
                toggleStyles.btn,
                reaction && toggleStyles.active,
              ]}
              onPress={() => setReaction(true)}
            >
              <Text>Да</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                toggleStyles.btn,
                !reaction && toggleStyles.active,
              ]}
              onPress={() => setReaction(false)}
            >
              <Text>Нет</Text>
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
    </SafeAreaView>
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
  empty: { padding: 12, color: '#999' },
});

const unitStyles = StyleSheet.create({
  container: { flexDirection: 'row' },
  item: {
    padding: 10,
    backgroundColor: '#EAF1F7',
    marginRight: 6,
    borderRadius: 10,
  },
  active: { backgroundColor: '#2F6690' },
});

const compStyles = StyleSheet.create({
  addBtn: {
    marginLeft: 8,
    backgroundColor: '#2F6690',
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
    backgroundColor: '#EAF1F7',
    padding: 8,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
  remove: { marginLeft: 6, color: '#E63946' },
});

const toggleStyles = StyleSheet.create({
  btn: {
    padding: 10,
    backgroundColor: '#EAF1F7',
    marginRight: 8,
    borderRadius: 10,
  },
  active: {
    backgroundColor: '#2F6690',
  },
});