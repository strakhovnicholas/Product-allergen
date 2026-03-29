import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import { getUserProfileApi, UserProfile } from '../../src/api/profileApi';

const quickActions = [
  {
    id: 1,
    title: 'Добавить\nзапись',
    iconName: 'plus-circle-outline',
    iconType: 'material',
    route: '/(tabs)/add',
  },
  {
    id: 2,
    title: 'Дневник',
    iconName: 'book-open',
    iconType: 'feather',
    route: '/(tabs)/diary',
  },
  {
    id: 3,
    title: 'Профиль',
    iconName: 'account',
    iconType: 'material',
    route: '/(tabs)/profile',
  },
  {
    id: 4,
    title: 'Отчёты',
    iconName: 'bar-chart-2',
    iconType: 'feather',
    route: '/(tabs)/reports',
  },
] as const;

type RecentEntry = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
  sortDate: string;
};

function renderQuickActionIcon(item: (typeof quickActions)[number]) {
  if (item.iconType === 'material') {
    return (
      <MaterialCommunityIcons
        name={item.iconName as any}
        size={28}
        color="#2F6690"
      />
    );
  }

  return <Feather name={item.iconName as any} size={28} color="#2F6690" />;
}

function formatTime(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isToday(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function getUserDisplayName(profile: UserProfile | null) {
  const fullName = profile?.fullName?.trim();

  if (!fullName) return 'Добро пожаловать';

  const firstName = fullName.split(' ')[1] || fullName.split(' ')[0];
  return `Здравствуйте, ${firstName}`;
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [commonFeelings, setCommonFeelings] = useState<CommonFeeling[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  const loadHomeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        profileData,
        commonData,
        symptomData,
        medicineData,
        foodData,
        noteData,
      ] = await Promise.all([
        getUserProfileApi(),
        getCommonFeelingsApi(),
        getSymptomsApi(),
        getMedicinesApi(),
        getFoodApi(),
        getNotesApi(),
      ]);

      setProfile(profileData ?? null);
      setCommonFeelings(commonData ?? []);
      setSymptoms(symptomData ?? []);
      setMedicines(medicineData ?? []);
      setFoods(foodData ?? []);
      setNotes(noteData ?? []);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить данные главной страницы'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHomeData();
    }, [loadHomeData])
  );

  const dailySummary = useMemo(() => {
    const todaySymptoms = symptoms.filter((item) => isToday(item.startTime));
    const todayMedicines = medicines.filter((item) => isToday(item.intakeTime));
    const todayFoodsWithReaction = foods.filter(
      (item) => isToday(item.intakeTime) && item.reactionOccurred
    );
    const todayNotes = notes.filter((item) => isToday(item.date));

    return [
      {
        id: 1,
        title: 'Симптомы',
        value: String(todaySymptoms.length),
        color: '#E63946',
        bg: '#FCEBED',
      },
      {
        id: 2,
        title: 'Лекарства',
        value: String(todayMedicines.length),
        color: '#2DCB70',
        bg: '#EAF8F0',
      },
      {
        id: 3,
        title: 'Реакции',
        value: String(todayFoodsWithReaction.length),
        color: '#D4A017',
        bg: '#FCF8E8',
      },
      {
        id: 4,
        title: 'Заметки',
        value: String(todayNotes.length),
        color: '#2F6690',
        bg: '#EAF1F7',
      },
    ];
  }, [symptoms, medicines, foods, notes]);

  const recentEntries = useMemo<RecentEntry[]>(() => {
    const recentSymptoms: RecentEntry[] = symptoms.map((item) => ({
      id: `symptom-${item.symptomsId}`,
      type: 'Симптом',
      title: item.symptomName,
      subtitle: `${formatTime(item.startTime)} · сила ${item.severity}/10`,
      icon: 'warning-outline',
      color: '#E63946',
      route: '/(tabs)/diary',
      sortDate: item.startTime,
    }));

    const recentFoods: RecentEntry[] = foods.map((item) => ({
      id: `food-${item.foodIntakeId}`,
      type: 'Питание',
      title: item.foodName,
      subtitle: `${formatTime(item.intakeTime)} · ${
        item.reactionOccurred ? 'была реакция' : 'без реакции'
      }`,
      icon: 'restaurant-outline',
      color: '#D4A017',
      route: '/(tabs)/diary',
      sortDate: item.intakeTime,
    }));

    const recentMedicines: RecentEntry[] = medicines.map((item) => ({
      id: `medicine-${item.id}`,
      type: 'Лекарство',
      title: item.medicineName,
      subtitle: `${formatTime(item.intakeTime)} · ${
        item.dosage != null ? `${item.dosage} ${item.unit ?? ''}`.trim() : 'доза не указана'
      }`,
      icon: 'medical-outline',
      color: '#2DCB70',
      route: '/(tabs)/diary',
      sortDate: item.intakeTime,
    }));

    const recentNotes: RecentEntry[] = notes.map((item) => ({
      id: `note-${item.noteId}`,
      type: 'Заметка',
      title: item.content.length > 28 ? `${item.content.slice(0, 28)}...` : item.content,
      subtitle: formatTime(item.date),
      icon: 'document-text-outline',
      color: '#2F6690',
      route: '/(tabs)/diary',
      sortDate: item.date,
    }));

    const recentFeelings: RecentEntry[] = commonFeelings.map((item) => ({
      id: `feeling-${item.feelingId}`,
      type: 'Самочувствие',
      title: `Самочувствие ${item.wellbeingScore}/10`,
      subtitle: `${formatTime(item.dateTime)} · настроение ${item.mood ?? '-'}`,
      icon: 'pulse-outline',
      color: '#7A5AF8',
      route: '/(tabs)/diary',
      sortDate: item.dateTime,
    }));

    return [
      ...recentSymptoms,
      ...recentFoods,
      ...recentMedicines,
      ...recentNotes,
      ...recentFeelings,
    ]
      .sort((a, b) => {
        const dateA = new Date(a.sortDate).getTime();
        const dateB = new Date(b.sortDate).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [symptoms, foods, medicines, notes, commonFeelings]);

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
              void loadHomeData(true);
            }}
          />
        }
      >
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>

              <View style={styles.userTextWrap}>
                <Text style={styles.welcomeTitle}>
                  {getUserDisplayName(profile)}
                </Text>
                <Text style={styles.welcomeSubtitle}>
                  Ваша сводка и последние записи за день
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Сегодня</Text>
            <Text style={styles.infoCardText}>
              Добавляйте симптомы, лекарства, питание и заметки, чтобы отслеживать триггеры и изменения самочувствия.
            </Text>
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Быстрые действия</Text>
          </View>

          <View style={styles.actionsGrid}>
            {quickActions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.actionCard}
                activeOpacity={0.85}
                onPress={() => handleNavigate(item.route)}
              >
                <View style={styles.actionIcon}>{renderQuickActionIcon(item)}</View>
                <Text style={styles.actionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сводка за сегодня</Text>

            <TouchableOpacity onPress={() => handleNavigate('/(tabs)/diary')}>
              <Text style={styles.linkText}>Открыть дневник</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryGrid}>
            {dailySummary.map((item) => (
              <View
                key={item.id}
                style={[styles.summaryCard, { backgroundColor: item.bg }]}
              >
                <Text style={[styles.summaryValue, { color: item.color }]}>
                  {item.value}
                </Text>
                <Text style={styles.summaryLabel}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Последние записи</Text>

            <TouchableOpacity onPress={() => handleNavigate('/(tabs)/diary')}>
              <Text style={styles.linkText}>Смотреть всё</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.entriesList}>
            {recentEntries.length === 0 ? (
              <Text style={styles.emptyText}>
                Пока нет записей. Добавьте первую запись в дневник.
              </Text>
            ) : (
              recentEntries.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.entryCard}
                  activeOpacity={0.85}
                  onPress={() => handleNavigate(item.route)}
                >
                  <View
                    style={[
                      styles.entryIconWrap,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>

                  <View style={styles.entryContent}>
                    <Text style={styles.entryType}>{item.type}</Text>
                    <Text style={styles.entryTitle}>{item.title}</Text>
                    <Text style={styles.entrySubtitle}>{item.subtitle}</Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    paddingBottom: 120,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topSection: {
    backgroundColor: '#2F6690',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  headerRow: {
    marginBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTextWrap: {
    flex: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#78A6C8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF55',
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: '#D8E7F3',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#4D7FA8',
    borderRadius: 24,
    padding: 20,
  },
  infoCardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoCardText: {
    color: '#E8F2F9',
    fontSize: 15,
    lineHeight: 22,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 18,
  },
  linkText: {
    color: '#2F6690',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 18,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#EAF1F7',
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  actionIcon: {
    marginBottom: 14,
  },
  actionText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    color: '#334155',
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#344054',
    fontWeight: '500',
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
  },
  entryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryType: {
    fontSize: 12,
    color: '#667085',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 2,
  },
  entrySubtitle: {
    fontSize: 14,
    color: '#667085',
  },
  emptyText: {
    fontSize: 14,
    color: '#98A2B3',
    lineHeight: 20,
  },
});