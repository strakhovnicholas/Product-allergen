import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
];

const dailySummary = [
  { id: 1, title: 'Симптомы', value: '3', color: '#E63946', bg: '#FCEBED' },
  { id: 2, title: 'Лекарства', value: '2', color: '#2DCB70', bg: '#EAF8F0' },
  { id: 3, title: 'Реакции', value: '1', color: '#D4A017', bg: '#FCF8E8' },
  { id: 4, title: 'Заметки', value: '1', color: '#2F6690', bg: '#EAF1F7' },
];

const recentEntries = [
  {
    id: 1,
    type: 'Симптом',
    title: 'Насморк',
    subtitle: '09:30 · умеренная выраженность',
    icon: 'warning-outline',
    color: '#E63946',
    route: '/(tabs)/diary',
  },
  {
    id: 2,
    type: 'Питание',
    title: 'Йогурт',
    subtitle: '08:30 · была реакция',
    icon: 'restaurant-outline',
    color: '#D4A017',
    route: '/(tabs)/diary',
  },
  {
    id: 3,
    type: 'Лекарство',
    title: 'Цетрин',
    subtitle: '09:00 · 10 мг',
    icon: 'medical-outline',
    color: '#2DCB70',
    route: '/(tabs)/diary',
  },
  {
    id: 4,
    type: 'Заметка',
    title: 'После завтрака',
    subtitle: 'Добавлен комментарий',
    icon: 'document-text-outline',
    color: '#2F6690',
    route: '/(tabs)/diary',
  },
];

function renderQuickActionIcon(item: (typeof quickActions)[0]) {
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

export default function HomeScreen() {
  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>

              <View>
                <Text style={styles.welcomeTitle}>Добро пожаловать</Text>
                <Text style={styles.welcomeSubtitle}>Желаем вам хорошего дня</Text>
              </View>
            </View>

            <View style={styles.bellWrapper}>
              <Ionicons name="notifications" size={22} color="#FFFFFF" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </View>

          <View style={styles.weatherCard}>
            <View style={styles.weatherLeft}>
              <Text style={styles.city}>Рязань</Text>
              <Text style={styles.temperature}>5°C</Text>
              <Text style={styles.weatherText}>Солнечно</Text>
            </View>
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
                onPress={() => handleNavigate(item.route)}>
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
                style={[styles.summaryCard, { backgroundColor: item.bg }]}>
                <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
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
            {recentEntries.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.entryCard}
                activeOpacity={0.85}
                onPress={() => handleNavigate(item.route)}>
                <View style={[styles.entryIconWrap, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>

                <View style={styles.entryContent}>
                  <Text style={styles.entryType}>{item.type}</Text>
                  <Text style={styles.entryTitle}>{item.title}</Text>
                  <Text style={styles.entrySubtitle}>{item.subtitle}</Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
              </TouchableOpacity>
            ))}
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
  topSection: {
    backgroundColor: '#2F6690',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bellWrapper: {
    position: 'relative',
    paddingTop: 4,
    paddingRight: 4,
    marginLeft: 12,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E63946',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  weatherCard: {
    backgroundColor: '#4D7FA8',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherLeft: {
    flex: 1,
  },
  city: {
    color: '#DCEAF5',
    fontSize: 15,
    marginBottom: 6,
  },
  temperature: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 46,
  },
  weatherText: {
    color: '#E8F2F9',
    fontSize: 18,
    marginTop: 6,
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
});