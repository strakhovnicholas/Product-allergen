import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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

type FilterType = 'all' | 'today' | 'week' | 'month';

function formatDate(date: string) {
  if (!date) return '-';

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isInFilter(date: string, filter: FilterType) {
  if (!date) return false;
  if (filter === 'all') return true;

  const itemDate = new Date(date);
  if (Number.isNaN(itemDate.getTime())) return false;

  const now = new Date();

  if (filter === 'today') {
    return (
      itemDate.getFullYear() === now.getFullYear() &&
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getDate() === now.getDate()
    );
  }

  const diff = now.getTime() - itemDate.getTime();

  if (filter === 'week') {
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }

  if (filter === 'month') {
    return diff <= 30 * 24 * 60 * 60 * 1000;
  }

  return true;
}

function SectionBlock({
  title,
  count,
  icon,
  onPress,
  children,
}: {
  title: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionWrap}>
      <TouchableOpacity
        style={styles.sectionHeader}
        activeOpacity={0.85}
        onPress={onPress}
      >
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIconWrap}>
            <Ionicons name={icon} size={18} color="#2F6690" />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        <View style={styles.sectionRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}</Text>
          </View>
          <Ionicons name="add-circle-outline" size={22} color="#2F6690" />
        </View>
      </TouchableOpacity>

      {children}
    </View>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyCardText}>{text}</Text>
    </View>
  );
}

function EntryCard({
  title,
  subtitle,
  children,
  onEdit,
  onDelete,
  deleting,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <View style={styles.entryCard}>
      <View style={styles.entryTop}>
        <View style={styles.entryTextBlock}>
          <Text style={styles.entryTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.entrySubtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.entryActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.85}
            disabled={deleting}
          >
            <Ionicons name="create-outline" size={16} color="#2F6690" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            activeOpacity={0.85}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#E63946" />
            ) : (
              <Ionicons name="trash-outline" size={16} color="#E63946" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {!!children && <View style={styles.entryBody}>{children}</View>}
    </View>
  );
}

function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

export default function DiaryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const [commonFeelings, setCommonFeelings] = useState<CommonFeeling[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const loadDiary = useCallback(async (isRefresh = false) => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDiary();
    }, [loadDiary])
  );

  const filteredCommonFeelings = useMemo(
    () => commonFeelings.filter((item) => isInFilter(item.dateTime, filter)),
    [commonFeelings, filter]
  );

  const filteredSymptoms = useMemo(
    () => symptoms.filter((item) => isInFilter(item.startTime, filter)),
    [symptoms, filter]
  );

  const filteredMedicines = useMemo(
    () => medicines.filter((item) => isInFilter(item.intakeTime, filter)),
    [medicines, filter]
  );

  const filteredFoods = useMemo(
    () => foods.filter((item) => isInFilter(item.intakeTime, filter)),
    [foods, filter]
  );

  const filteredNotes = useMemo(
    () => notes.filter((item) => isInFilter(item.date, filter)),
    [notes, filter]
  );

  const totalCount = useMemo(
    () =>
      filteredCommonFeelings.length +
      filteredSymptoms.length +
      filteredMedicines.length +
      filteredFoods.length +
      filteredNotes.length,
    [
      filteredCommonFeelings,
      filteredSymptoms,
      filteredMedicines,
      filteredFoods,
      filteredNotes,
    ]
  );

  const confirmDelete = useCallback(
    (id: string, title: string, onDelete: () => Promise<void>) => {
      Alert.alert('Удаление', `Удалить запись "${title}"?`, [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(id);
              await onDelete();
              await loadDiary(true);
            } catch (error) {
              Alert.alert(
                'Ошибка',
                error instanceof Error ? error.message : 'Не удалось удалить запись'
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]);
    },
    [loadDiary]
  );

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
            onRefresh={() => {
              void loadDiary(true);
            }}
          />
        }
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Дневник</Text>
          <Text style={styles.heroSubtitle}>
            Все записи на одной странице: самочувствие, симптомы, лекарства,
            питание и заметки.
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalCount}</Text>
              <Text style={styles.summaryLabel}>Всего записей</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{filteredFoods.length}</Text>
              <Text style={styles.summaryLabel}>Питание</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{filteredSymptoms.length}</Text>
              <Text style={styles.summaryLabel}>Симптомы</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {[
            { key: 'all', label: 'Все' },
            { key: 'today', label: 'Сегодня' },
            { key: 'week', label: '7 дней' },
            { key: 'month', label: '30 дней' },
          ].map((item) => {
            const active = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.85}
                onPress={() => setFilter(item.key as FilterType)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    active && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <SectionBlock
          title="Самочувствие"
          count={filteredCommonFeelings.length}
          icon="pulse-outline"
          onPress={() => router.push('/add-common' as any)}
        >
          {filteredCommonFeelings.length === 0 ? (
            <EmptySection text="Записей самочувствия пока нет" />
          ) : (
            filteredCommonFeelings.map((item) => (
              <EntryCard
                key={`common-${item.feelingId}`}
                title={`Самочувствие ${item.wellbeingScore}/10`}
                subtitle={formatDate(item.dateTime)}
                deleting={deletingId === `common-${item.feelingId}`}
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
                  confirmDelete(
                    `common-${item.feelingId}`,
                    `Самочувствие ${item.wellbeingScore}/10`,
                    async () => {
                      await deleteCommonFeelingApi(item.feelingId);
                    }
                  )
                }
              >
                <MetaRow
                  label="Настроение"
                  value={item.mood != null ? `${item.mood}/10` : '-'}
                />
                <MetaRow
                  label="Энергия"
                  value={
                    item.energyLevel != null ? `${item.energyLevel}/10` : '-'
                  }
                />
                <MetaRow label="Комментарий" value={item.comment || '-'} />
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Симптомы"
          count={filteredSymptoms.length}
          icon="warning-outline"
          onPress={() => router.push('/add-symptom' as any)}
        >
          {filteredSymptoms.length === 0 ? (
            <EmptySection text="Симптомов пока нет" />
          ) : (
            filteredSymptoms.map((item) => (
              <EntryCard
                key={`symptom-${item.symptomsId}`}
                title={item.symptomName}
                subtitle={formatDate(item.startTime)}
                deleting={deletingId === `symptom-${item.symptomsId}`}
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
                  confirmDelete(
                    `symptom-${item.symptomsId}`,
                    item.symptomName,
                    async () => {
                      await deleteSymptomApi(item.symptomsId);
                    }
                  )
                }
              >
                <MetaRow label="Сила" value={`${item.severity}/10`} />
                <MetaRow label="Начало" value={formatDate(item.startTime)} />
                <MetaRow
                  label="Конец"
                  value={item.endTime ? formatDate(item.endTime) : '-'}
                />
                <MetaRow label="Причина" value={item.possibleCause || '-'} />
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Лекарства"
          count={filteredMedicines.length}
          icon="medical-outline"
          onPress={() => router.push('/add-medicine' as any)}
        >
          {filteredMedicines.length === 0 ? (
            <EmptySection text="Лекарств пока нет" />
          ) : (
            filteredMedicines.map((item) => (
              <EntryCard
                key={`medicine-${item.id}`}
                title={item.medicineName}
                subtitle={formatDate(item.intakeTime)}
                deleting={deletingId === `medicine-${item.id}`}
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
                  confirmDelete(
                    `medicine-${item.id}`,
                    item.medicineName,
                    async () => {
                      await deleteMedicineApi(item.id);
                    }
                  )
                }
              >
                <MetaRow
                  label="Дозировка"
                  value={
                    item.dosage != null
                      ? `${item.dosage} ${item.unit ?? ''}`.trim()
                      : '-'
                  }
                />
                <MetaRow label="Время" value={formatDate(item.intakeTime)} />
                <MetaRow label="Причина" value={item.reason || '-'} />
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Питание"
          count={filteredFoods.length}
          icon="restaurant-outline"
          onPress={() => router.push('/add-food' as any)}
        >
          {filteredFoods.length === 0 ? (
            <EmptySection text="Записей о питании пока нет" />
          ) : (
            filteredFoods.map((item) => (
              <EntryCard
                key={`food-${item.foodIntakeId}`}
                title={item.foodName}
                subtitle={formatDate(item.intakeTime)}
                deleting={deletingId === `food-${item.foodIntakeId}`}
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
                  confirmDelete(
                    `food-${item.foodIntakeId}`,
                    item.foodName,
                    async () => {
                      await deleteFoodApi(item.foodIntakeId);
                    }
                  )
                }
              >
                <MetaRow label="Категория" value={item.category || '-'} />
                <MetaRow
                  label="Количество"
                  value={
                    item.amount != null
                      ? `${item.amount} ${item.unit ?? ''}`.trim()
                      : '-'
                  }
                />
                <MetaRow
                  label="Реакция"
                  value={item.reactionOccurred ? 'Да' : 'Нет'}
                />
                <MetaRow
                  label="Описание"
                  value={item.reactionDescription || '-'}
                />
              </EntryCard>
            ))
          )}
        </SectionBlock>

        <SectionBlock
          title="Заметки"
          count={filteredNotes.length}
          icon="document-text-outline"
          onPress={() => router.push('/add-note' as any)}
        >
          {filteredNotes.length === 0 ? (
            <EmptySection text="Заметок пока нет" />
          ) : (
            filteredNotes.map((item) => (
              <EntryCard
                key={`note-${item.noteId}`}
                title={formatDate(item.date)}
                subtitle="Заметка"
                deleting={deletingId === `note-${item.noteId}`}
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
                  confirmDelete(
                    `note-${item.noteId}`,
                    formatDate(item.date),
                    async () => {
                      await deleteNoteApi(item.noteId);
                    }
                  )
                }
              >
                <Text style={styles.noteText}>{item.content}</Text>
              </EntryCard>
            ))
          )}
        </SectionBlock>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
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

  heroCard: {
    backgroundColor: '#2F6690',
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#D8E7F3',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: '#4D7FA8',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    color: '#DCEAF5',
    fontSize: 12,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#FFFFFF33',
  },

  filtersRow: {
    paddingBottom: 6,
    paddingRight: 8,
    marginBottom: 8,
  },
  filterChip: {
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#2F6690',
  },
  filterChipText: {
    color: '#2F6690',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  sectionWrap: {
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#233142',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    minWidth: 32,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#2F6690',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  emptyCardText: {
    color: '#98A2B3',
    fontSize: 14,
    lineHeight: 20,
  },

  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  entryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  entryTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 13,
    color: '#667085',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FCEBED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },

  metaRow: {
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 12,
    color: '#98A2B3',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    color: '#344054',
    lineHeight: 20,
  },
  noteText: {
    fontSize: 14,
    color: '#344054',
    lineHeight: 21,
  },
});