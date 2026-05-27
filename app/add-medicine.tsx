import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
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
  getMedicinesCatalogApi,
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
    intakeDate?: string;
  }>();

  const isEdit = useMemo(
    () => Boolean(params.id),
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
        const data = await getMedicinesCatalogApi();

        const unique = [
          ...new Set(
            data?.map((i: any) => i.medicineName).filter(Boolean)
          ),
        ];

        setMedicineList(unique);
      } catch (e) {
        console.log(e);
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

    if (!name) {
      Alert.alert('Ошибка', 'Введите название лекарства');
      return;
    }

    const parsedDosage = Number((dosage || '1').trim());

    if (Number.isNaN(parsedDosage) || parsedDosage <= 0) {
      Alert.alert('Ошибка', 'Введите корректную дозировку (больше 0)');
      return;
    }

    const payload = {
      medicineName: name,
      dosage: parsedDosage,
      unit: mapUnit(unit), // 🔥 ФИКС
      intakeDate: params.intakeDate ?? new Date().toISOString(),
    };

    setIsSubmitting(true);

    try {
      if (isEdit && params.id) {
        await updateMedicineApi(params.id, payload);
      } else {
        await createMedicineApi(payload);
      }

      router.back();
    } catch {
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
          <View style={ui.sectionCard}>
            <View style={ui.sectionHead}>
              <Ionicons name="medkit-outline" size={18} color="#1D4ED8" />
              <Text style={ui.sectionHeadText}>Препарат</Text>
            </View>
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
          </View>

          {showDropdown && (
            <View style={searchStyles.dropdown}>
              <ScrollView style={{ maxHeight: 150 }}>
                {filtered.length > 0 ? (
                  filtered.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={searchStyles.item}
                      onPress={() => {
                        setSelectedMedicine(item);
                        setSearch(item);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={searchStyles.itemTitle}>{item}</Text>
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

          <View style={ui.sectionCard}>
            <View style={ui.sectionHead}>
              <Ionicons name="speedometer-outline" size={18} color="#1D4ED8" />
              <Text style={ui.sectionHeadText}>Дозировка</Text>
            </View>

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
                    <Text style={[unitStyles.itemText, unit === u && unitStyles.itemTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  itemTitle: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  empty: {
    padding: 12,
    color: '#999',
  },
});

const unitStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    padding: 4,
  },
  item: {
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 4,
  },
  active: {
    backgroundColor: '#1D4ED8',
  },
  itemText: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  itemTextActive: {
    color: '#fff',
  },
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