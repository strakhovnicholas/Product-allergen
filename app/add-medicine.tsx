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
  createMedicineApi,
  getMedicinesApi,
  updateMedicineApi,
} from '../src/api/diaryApi';

import { formStyles as styles } from '../src/styles/formStyles';

// 🔥 МАППИНГ ПОД БЭК
const mapUnit = (u: string) => {
  switch (u) {
    case 'мг':
      return 'MG';
    case 'мл':
      return 'ML';
    case 'таб':
      return 'TABLET';
    default:
      return 'MG';
  }
};

export default function AddMedicineScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    medicineName?: string;
    dosage?: string;
    unit?: string;
  }>();

  const isEdit = useMemo(
    () => Boolean(params.id && params.id.length > 10),
    [params.id]
  );

  const [medicineList, setMedicineList] = useState<string[]>([]);
  const [search, setSearch] = useState(params.medicineName ?? '');
  const [selectedMedicine, setSelectedMedicine] = useState(
    params.medicineName ?? ''
  );

  const [dosage, setDosage] = useState(params.dosage ?? '');
  const [unit, setUnit] = useState(params.unit ?? 'мг');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // ===== LOAD =====
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMedicinesApi();

        console.log('📦 API MEDICINES:', data);

        const unique = [
          ...new Set(
            data?.map((i: any) => i.medicineName).filter(Boolean)
          ),
        ];

        setMedicineList(unique);
      } catch (e) {
        console.log('❌ LOAD ERROR:', e);
      }
    };

    load();
  }, []);

  // ===== FILTER =====
  const filtered = useMemo(() => {
    if (!search.trim()) return medicineList;

    return medicineList.filter((item) =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, medicineList]);

  // ===== SAVE =====
  const handleSave = async () => {
    const name = selectedMedicine || search.trim();

    console.log('🧠 NAME:', name);
    console.log('🧠 DOSAGE:', dosage);
    console.log('🧠 UNIT:', unit);

    if (!name) {
      Alert.alert('Ошибка', 'Введите название лекарства');
      return;
    }

    const parsedDosage = Number(dosage);

    if (!dosage || Number.isNaN(parsedDosage)) {
      Alert.alert('Ошибка', 'Введите корректную дозировку');
      return;
    }

    const payload = {
      medicineName: name,
      dosage: parsedDosage,
      unit: mapUnit(unit), // 🔥 ФИКС
      intakeTime: new Date().toISOString(),
      medicationType: 1,
      reason: '',
    };

    console.log('🚀 PAYLOAD:', JSON.stringify(payload, null, 2));

    setIsSubmitting(true);

    try {
      if (isEdit && params.id) {
        await updateMedicineApi(params.id, payload);
      } else {
        await createMedicineApi(payload);
      }

      console.log('✅ SUCCESS');
      router.back();
    } catch (e: any) {
      console.log('❌ ERROR FULL:', e);
      Alert.alert('Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать лекарство' : 'Лекарство'}
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Название</Text>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Введите лекарство..."
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
                        console.log('👆 SELECT:', item);
                        setSelectedMedicine(item);
                        setSearch(item);
                        setShowDropdown(false); // 🔥 фикс
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

          <Text style={styles.label}>Дозировка</Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType="numeric"
              value={dosage}
              onChangeText={setDosage}
              placeholder="Например: 500"
            />

            <View style={unitStyles.container}>
              {['мг', 'мл', 'таб'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    unitStyles.item,
                    unit === u && unitStyles.active,
                  ]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={unit === u && { color: '#fff' }}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
  item: {
    padding: 12,
  },
  empty: {
    padding: 12,
    color: '#999',
  },
});

const unitStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  item: {
    padding: 10,
    backgroundColor: '#EAF1F7',
    marginRight: 6,
    borderRadius: 10,
  },
  active: {
    backgroundColor: '#2F6690',
  },
});