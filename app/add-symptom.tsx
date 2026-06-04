import { ScreenSafeArea } from '../components/ScreenSafeArea';
import { nowAppDateTimeString } from '../src/utils/datetime';
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
  createSymptomApi,
  getSymptomsApi,
  updateSymptomApi,
} from '../src/api/diaryApi';

import { formStyles as styles } from '../src/styles/formStyles';

export default function AddSymptomScreen() {
  const params = useLocalSearchParams<{
    symptomsId?: string;
    symptomName?: string;
    severity?: string;
  }>();

  const isEdit = useMemo(() => Boolean(params.symptomsId), [params.symptomsId]);

  // ===== STATE =====
  const [symptomList, setSymptomList] = useState<string[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState(
    params.symptomName ?? ''
  );

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [severity, setSeverity] = useState(
    params.severity ? Number(params.severity) : 1
  );

  const [possibleCause, setPossibleCause] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  // ===== LOAD =====
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSymptomsApi();

        const unique = [
          ...new Set(
            data
              .map((i: any) => i.symptomName)
              .filter(Boolean)
          ),
        ];

        setSymptomList(unique);
      } catch (e) {
        console.log(e);
      }
    };

    load();
  }, []);

  // ===== DEBOUNCE =====
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(t);
  }, [search]);

  // ===== FILTER =====
  const filteredSymptoms = useMemo(() => {
    if (!debouncedSearch.trim()) return symptomList;

    return symptomList.filter((item) =>
      item.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [debouncedSearch, symptomList]);

  // ===== SAVE =====
  const handleSave = async () => {
    const name = selectedSymptom || search.trim();

    if (!name) {
      Alert.alert('Ошибка', 'Введите или выберите симптом');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        symptomName: name,
        severity,
        startTime: nowAppDateTimeString(),
        possibleCause: possibleCause.trim() || undefined,
      };

      if (isEdit && params.symptomsId) {
        await updateSymptomApi(params.symptomsId, payload);
      } else {
        await createSymptomApi(payload);
      }

      router.back();
    } catch (error) {
      Alert.alert('Ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== HIGHLIGHT =====
  const highlight = (text: string) => {
    const index = text.toLowerCase().indexOf(debouncedSearch.toLowerCase());
    if (index === -1) return <Text>{text}</Text>;

    return (
      <Text>
        {text.slice(0, index)}
        <Text style={{ fontWeight: '700' }}>
          {text.slice(index, index + debouncedSearch.length)}
        </Text>
        {text.slice(index + debouncedSearch.length)}
      </Text>
    );
  };

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {isEdit ? 'Редактировать симптом' : 'Симптом'}
        </Text>

        <View style={styles.card}>
          {/* ===== SEARCH ===== */}
          <Text style={styles.label}>Поиск симптома</Text>

          <TextInput
            style={styles.input}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setShowDropdown(true);
            }}
            placeholder="Введите симптом..."
          />

          {/* ===== DROPDOWN ===== */}
          {showDropdown && (
            <View style={searchStyles.dropdown}>
              <ScrollView style={{ maxHeight: 150 }}>
                {filteredSymptoms.length > 0 ? (
                  filteredSymptoms.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={searchStyles.item}
                      onPress={() => {
                        setSelectedSymptom(item);
                        setSearch(item);
                        setShowDropdown(false);
                      }}
                    >
                      {highlight(item)}
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

          {/* ===== СИЛА ===== */}
          <Text style={styles.label}>Сила симптома</Text>

          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((s) => {
              const active = s <= severity;

              return (
                <TouchableOpacity key={s} onPress={() => setSeverity(s)}>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      marginRight: 8,
                      backgroundColor: active ? '#2F6690' : '#D0D5DD',
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ===== ПРИЧИНА ===== */}
          <Text style={styles.label}>Причина (необязательно)</Text>
          <TextInput
            style={styles.input}
            value={possibleCause}
            onChangeText={setPossibleCause}
            placeholder="Например: еда, стресс..."
          />

          {/* ===== BUTTON ===== */}
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
  item: {
    padding: 12,
  },
  empty: {
    padding: 12,
    color: '#999',
  },
});