import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CommonFeeling,
  deleteCommonFeelingApi,
  deleteFoodApi,
  deleteMedicineApi,
  deleteNoteApi,
  deleteSymptomApi,
  Food,
  getCommonFeelingsApi,
  getFoodApi,
  getMedicinesApi,
  getNotesApi,
  getSymptomsApi,
  Medicine,
  Note,
  Symptom,
} from '../../src/api/diaryApi';

export default function DiaryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [commonFeelings, setCommonFeelings] = useState<CommonFeeling[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const loadDiary = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [commonData, symptomData, medicineData, foodData, noteData] =
        await Promise.all([
          getCommonFeelingsApi(),
          getSymptomsApi(),
          getMedicinesApi(),
          getFoodApi(),
          getNotesApi(),
        ]);

      setCommonFeelings(commonData ?? []);
      setSymptoms(symptomData ?? []);
      setMedicines(medicineData ?? []);
      setFoods(foodData ?? []);
      setNotes(noteData ?? []);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось загрузить дневник'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadDiary();
    }, [])
  );

  const confirmDelete = (title: string, onDelete: () => Promise<void>) => {
    Alert.alert('Удаление', `Удалить запись "${title}"?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await onDelete();
            await loadDiary(true);
          } catch (error) {
            Alert.alert(
              'Ошибка',
              error instanceof Error ? error.message : 'Не удалось удалить запись'
            );
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#2F6690" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadDiary(true)}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Дневник</Text>
          <Text style={styles.subtitle}>Все записи на одной странице</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/add-common' as any)}>
            <Text style={styles.actionBtnText}>Самочувствие</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/add-symptom' as any)}>
            <Text style={styles.actionBtnText}>Симптом</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/add-medicine' as any)}>
            <Text style={styles.actionBtnText}>Лекарство</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/add-food' as any)}>
            <Text style={styles.actionBtnText}>Еда</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/add-note' as any)}>
            <Text style={styles.actionBtnText}>Заметка</Text>
          </TouchableOpacity>
        </View>

        <Section title="Самочувствие">
          {commonFeelings.length === 0 ? (
            <EmptyText text="Записей самочувствия пока нет" />
          ) : (
            commonFeelings.map((item) => (
              <Card
                key={String(item.feelingId)}
                title={formatDate(item.dateTime)}
                onEdit={() =>
                  router.push({
                    pathname: '/add-common',
                    params: {
                      feelingId: String(item.feelingId),
                      dateTime: item.dateTime,
                      wellbeingScore: String(item.wellbeingScore),
                      mood: item.mood != null ? String(item.mood) : '',
                      energyLevel:
                        item.energyLevel != null ? String(item.energyLevel) : '',
                      comment: item.comment ?? '',
                    },
                  } as any)
                }
                onDelete={() =>
                  confirmDelete(formatDate(item.dateTime), async () => {
                    await deleteCommonFeelingApi(item.feelingId);
                  })
                }>
                <Text style={styles.meta}>
                  Самочувствие: {item.wellbeingScore}/10
                </Text>
                <Text style={styles.meta}>
                  Настроение: {item.mood ?? '-'} / 10
                </Text>
                <Text style={styles.meta}>
                  Энергия: {item.energyLevel ?? '-'} / 10
                </Text>
                {!!item.comment && (
                  <Text style={styles.meta}>Комментарий: {item.comment}</Text>
                )}
              </Card>
            ))
          )}
        </Section>

        <Section title="Симптомы">
          {symptoms.length === 0 ? (
            <EmptyText text="Симптомов пока нет" />
          ) : (
            symptoms.map((item) => (
              <Card
                key={String(item.symptomsId)}
                title={item.symptomName}
                onEdit={() =>
                  router.push({
                    pathname: '/add-symptom',
                    params: {
                      symptomsId: String(item.symptomsId),
                      symptomName: item.symptomName,
                      severity: String(item.severity),
                      startTime: item.startTime,
                      endTime: item.endTime ?? '',
                      possibleCause: item.possibleCause ?? '',
                    },
                  } as any)
                }
                onDelete={() =>
                  confirmDelete(item.symptomName, async () => {
                    await deleteSymptomApi(item.symptomsId);
                  })
                }>
                <Text style={styles.meta}>Сила: {item.severity}/10</Text>
                <Text style={styles.meta}>
                  Начало: {formatDate(item.startTime)}
                </Text>
                {!!item.endTime && (
                  <Text style={styles.meta}>
                    Конец: {formatDate(item.endTime)}
                  </Text>
                )}
                {!!item.possibleCause && (
                  <Text style={styles.meta}>Причина: {item.possibleCause}</Text>
                )}
              </Card>
            ))
          )}
        </Section>

        <Section title="Лекарства">
          {medicines.length === 0 ? (
            <EmptyText text="Лекарств пока нет" />
          ) : (
            medicines.map((item) => (
              <Card
                key={String(item.id)}
                title={item.medicineName}
                onEdit={() =>
                  router.push({
                    pathname: '/add-medicine',
                    params: {
                      id: String(item.id),
                      medicineName: item.medicineName,
                      dosage: item.dosage != null ? String(item.dosage) : '',
                      unit: item.unit ?? '',
                      intakeTime: item.intakeTime,
                      medicationType:
                        item.medicationType != null
                          ? String(item.medicationType)
                          : '',
                      reason: item.reason ?? '',
                    },
                  } as any)
                }
                onDelete={() =>
                  confirmDelete(item.medicineName, async () => {
                    await deleteMedicineApi(item.id);
                  })
                }>
                <Text style={styles.meta}>
                  Доза: {item.dosage ?? '-'} {item.unit ?? ''}
                </Text>
                <Text style={styles.meta}>
                  Время: {formatDate(item.intakeTime)}
                </Text>
                {!!item.reason && (
                  <Text style={styles.meta}>Причина: {item.reason}</Text>
                )}
              </Card>
            ))
          )}
        </Section>

        <Section title="Еда">
          {foods.length === 0 ? (
            <EmptyText text="Записей о еде пока нет" />
          ) : (
            foods.map((item) => (
              <Card
                key={String(item.foodIntakeId)}
                title={item.foodName}
                onEdit={() =>
                  router.push({
                    pathname: '/add-food',
                    params: {
                      foodIntakeId: String(item.foodIntakeId),
                      foodName: item.foodName,
                      category: item.category ?? '',
                      amount: item.amount != null ? String(item.amount) : '',
                      unit: item.unit ?? '',
                      intakeTime: item.intakeTime,
                      reactionOccurred: String(item.reactionOccurred),
                      reactionDescription: item.reactionDescription ?? '',
                    },
                  } as any)
                }
                onDelete={() =>
                  confirmDelete(item.foodName, async () => {
                    await deleteFoodApi(item.foodIntakeId);
                  })
                }>
                {!!item.category && (
                  <Text style={styles.meta}>Категория: {item.category}</Text>
                )}
                <Text style={styles.meta}>
                  Количество: {item.amount ?? '-'} {item.unit ?? ''}
                </Text>
                <Text style={styles.meta}>
                  Время: {formatDate(item.intakeTime)}
                </Text>
                <Text style={styles.meta}>
                  Реакция: {item.reactionOccurred ? 'Да' : 'Нет'}
                </Text>
                {!!item.reactionDescription && (
                  <Text style={styles.meta}>
                    Описание: {item.reactionDescription}
                  </Text>
                )}
              </Card>
            ))
          )}
        </Section>

        <Section title="Заметки">
          {notes.length === 0 ? (
            <EmptyText text="Заметок пока нет" />
          ) : (
            notes.map((item) => (
              <Card
                key={String(item.noteId)}
                title={formatDate(item.date)}
                onEdit={() =>
                  router.push({
                    pathname: '/add-note',
                    params: {
                      noteId: String(item.noteId),
                      content: item.content,
                      date: item.date,
                    },
                  } as any)
                }
                onDelete={() =>
                  confirmDelete(formatDate(item.date), async () => {
                    await deleteNoteApi(item.noteId);
                  })
                }>
                <Text style={styles.meta}>{item.content}</Text>
              </Card>
            ))
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Card({
  title,
  children,
  onEdit,
  onDelete,
}: {
  title: string;
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={onEdit}
            activeOpacity={0.85}>
            <Text style={styles.editBtnText}>Редактировать</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            activeOpacity={0.85}>
            <Text style={styles.deleteBtnText}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {children}
    </View>
  );
}

function EmptyText({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function formatDate(date: string) {
  if (!date) return '-';

  try {
    return new Date(date).toLocaleString('ru-RU');
  } catch {
    return date;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
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
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  actionBtn: {
    backgroundColor: '#EAF1F7',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionBtnText: {
    color: '#2F6690',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 10,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  meta: {
    fontSize: 14,
    color: '#5B6776',
    marginBottom: 4,
    lineHeight: 20,
  },
  editBtn: {
    backgroundColor: '#EAF1F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  editBtnText: {
    color: '#2F6690',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FCEBED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  deleteBtnText: {
    color: '#E63946',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#98A2B3',
    marginBottom: 10,
  },
});