import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const addOptions = [
  {
    id: 1,
    title: 'Самочувствие',
    subtitle: 'Оценка состояния, настроения и энергии',
    iconType: 'ion',
    iconName: 'pulse-outline',
    route: '/add-common',
    bg: '#EAF1F7',
    color: '#2F6690',
  },
  {
    id: 2,
    title: 'Симптом',
    subtitle: 'Насморк, зуд, чихание и другие проявления',
    iconType: 'material',
    iconName: 'emoticon-sneeze-outline',
    route: '/add-symptom',
    bg: '#FCEBED',
    color: '#E63946',
  },
  {
    id: 3,
    title: 'Лекарство',
    subtitle: 'Приём препаратов и дозировка',
    iconType: 'ion',
    iconName: 'medical-outline',
    route: '/add-medicine',
    bg: '#EAF8F0',
    color: '#2DCB70',
  },
  {
    id: 4,
    title: 'Питание',
    subtitle: 'Продукты, категории и возможная реакция',
    iconType: 'ion',
    iconName: 'restaurant-outline',
    route: '/add-food',
    bg: '#FCF8E8',
    color: '#D4A017',
  },
  {
    id: 5,
    title: 'Заметка',
    subtitle: 'Наблюдения, комментарии и важные детали',
    iconType: 'ion',
    iconName: 'document-text-outline',
    route: '/add-note',
    bg: '#F4ECFF',
    color: '#7A5AF8',
  },
];

function renderIcon(item: (typeof addOptions)[0]) {
  if (item.iconType === 'material') {
    return (
      <MaterialCommunityIcons
        name={item.iconName as any}
        size={28}
        color={item.color}
      />
    );
  }

  return <Ionicons name={item.iconName as any} size={28} color={item.color} />;
}

export default function AddScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Добавить</Text>
          <Text style={styles.subtitle}>
            Выберите тип записи, которую хотите сохранить в дневнике
          </Text>
        </View>

        <View style={styles.cardSection}>
          {addOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.optionCard}
              activeOpacity={0.85}
              onPress={() => router.push(item.route as any)}>
              <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>
                {renderIcon(item)}
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#98A2B3" />
            </TouchableOpacity>
          ))}
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
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 12,
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
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
    paddingRight: 12,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#667085',
    lineHeight: 20,
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: '#EAF1F7',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: '#2F6690',
    fontSize: 14,
    lineHeight: 20,
  },
});