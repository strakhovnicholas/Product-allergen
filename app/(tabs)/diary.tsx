import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type DiaryTab = 'common' | 'symptoms' | 'medicines' | 'food' | 'notes';

const TABS: { key: DiaryTab; label: string }[] = [
  { key: 'common', label: 'Самочувствие' },
  { key: 'symptoms', label: 'Симптомы' },
  { key: 'medicines', label: 'Лекарства' },
  { key: 'food', label: 'Питание' },
  { key: 'notes', label: 'Заметки' },
];

const commonFeelings = [
  {
    id: 1,
    dateTime: 'Сегодня, 09:20',
    wellbeingScore: 6,
    mood: 5,
    energyLevel: 4,
    comment: 'Есть слабость и небольшой дискомфорт после завтрака.',
  },
  {
    id: 2,
    dateTime: 'Вчера, 20:10',
    wellbeingScore: 8,
    mood: 7,
    energyLevel: 7,
    comment: 'Вечером состояние было стабильное.',
  },
];

const symptoms = [
  {
    id: 1,
    symptomName: 'Насморк',
    severity: 8,
    startTime: '09:30',
    endTime: '14:00',
    possibleCause: 'Пыльца / еда',
    color: '#E63946',
    bg: '#FCEBED',
    icon: 'weather-windy',
  },
  {
    id: 2,
    symptomName: 'Слезотечение',
    severity: 6,
    startTime: '10:00',
    endTime: '12:30',
    possibleCause: 'Пыль',
    color: '#D4A017',
    bg: '#FCF8E8',
    icon: 'eye-outline',
  },
  {
    id: 3,
    symptomName: 'Чихание',
    severity: 4,
    startTime: '11:15',
    endTime: '11:45',
    possibleCause: 'Берёза',
    color: '#F77F00',
    bg: '#FDF1E7',
    icon: 'emoticon-sneeze-outline',
  },
];

const medicines = [
  {
    id: 1,
    medicineName: 'Цетрин',
    dosage: 10,
    unit: 'мг',
    intakeTime: '09:00',
    medicationType: 'Антигистаминное',
    reason: 'Аллергический насморк',
  },
  {
    id: 2,
    medicineName: 'Назонекс',
    dosage: 2,
    unit: 'впрыска',
    intakeTime: '20:00',
    medicationType: 'Спрей',
    reason: 'Заложенность носа',
  },
];

const food = [
  {
    id: 1,
    foodName: 'Йогурт',
    category: 'DAIRY',
    amount: 150,
    unit: 'г',
    intakeTime: '08:30',
    reactionOccurred: true,
    reactionDescription: 'Зуд в горле',
  },
  {
    id: 2,
    foodName: 'Яблоко',
    category: 'FRUIT',
    amount: 1,
    unit: 'шт',
    intakeTime: '12:15',
    reactionOccurred: false,
    reactionDescription: '',
  },
];

const notes = [
  {
    id: 1,
    title: 'Реакция после завтрака',
    content:
      'После молочного продукта появилась лёгкая реакция. Нужно понаблюдать ещё несколько дней.',
    createdAt: 'Сегодня, 10:10',
  },
  {
    id: 2,
    title: 'Общее наблюдение',
    content:
      'Симптомы усиливаются в первой половине дня, особенно после выхода на улицу.',
    createdAt: 'Вчера, 18:40',
  },
];

function severityLabel(value: number) {
  if (value >= 8) return 'Сильно';
  if (value >= 5) return 'Умеренно';
  return 'Слабо';
}

export default function DiaryScreen() {
  const [activeTab, setActiveTab] = useState<DiaryTab>('symptoms');

  const activeTitle = useMemo(() => {
    return TABS.find((tab) => tab.key === activeTab)?.label ?? 'Дневник';
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Дневник</Text>
          <Text style={styles.subtitle}>
            Самочувствие, симптомы, лекарства, питание и заметки в одном месте
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}>
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeTitle}</Text>

            <TouchableOpacity
  style={styles.addButton}
  activeOpacity={0.85}
  onPress={() => {
    if (activeTab === 'common') {
      router.push('/add-common' as any);
      return;
    }

    if (activeTab === 'symptoms') {
      router.push('/add-symptom' as any);
      return;
    }

    if (activeTab === 'medicines') {
      router.push('/add-medicine' as any);
      return;
    }

    if (activeTab === 'food') {
      router.push('/add-food' as any);
      return;
    }

    if (activeTab === 'notes') {
      router.push('/add-note' as any);
    }
  }}>
  <Ionicons name="add" size={18} color="#2F6690" />
  <Text style={styles.addButtonText}>Добавить</Text>
</TouchableOpacity>
          </View>

          {activeTab === 'common' && (
            <View style={styles.blockList}>
              {commonFeelings.map((item) => (
                <View key={item.id} style={styles.commonCard}>
                  <Text style={styles.commonDate}>{item.dateTime}</Text>

                  <View style={styles.scoreRow}>
                    <View style={[styles.scoreBadge, { backgroundColor: '#EAF1F7' }]}>
                      <Text style={[styles.scoreValue, { color: '#2F6690' }]}>
                        Самочувствие: {item.wellbeingScore}/10
                      </Text>
                    </View>

                    <View style={[styles.scoreBadge, { backgroundColor: '#FCF8E8' }]}>
                      <Text style={[styles.scoreValue, { color: '#D4A017' }]}>
                        Настроение: {item.mood}/10
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scoreRow}>
                    <View style={[styles.scoreBadge, { backgroundColor: '#EAF8F0' }]}>
                      <Text style={[styles.scoreValue, { color: '#2DCB70' }]}>
                        Энергия: {item.energyLevel}/10
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.commonComment}>{item.comment}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'symptoms' && (
            <View style={styles.blockList}>
              {symptoms.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.symptomCard,
                    { backgroundColor: item.bg, borderColor: `${item.color}55` },
                  ]}>
                  <View style={styles.symptomHeader}>
                    <View style={styles.symptomTitleRow}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={24}
                        color={item.color}
                        style={styles.symptomIcon}
                      />
                      <Text style={styles.symptomTitle}>{item.symptomName}</Text>
                    </View>

                    <TouchableOpacity activeOpacity={0.8}>
                      <Ionicons name="close" size={20} color={item.color} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tagRow}>
                    <View style={[styles.statusTag, { backgroundColor: item.color }]}>
                      <Text style={styles.statusTagText}>
                        {severityLabel(item.severity)} ({item.severity}/10)
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.metaText}>
                    Время: {item.startTime} - {item.endTime}
                  </Text>
                  <Text style={styles.metaText}>Причина: {item.possibleCause}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'medicines' && (
            <View style={styles.blockList}>
              {medicines.map((item) => (
                <View key={item.id} style={styles.defaultCard}>
                  <View style={styles.defaultHeader}>
                    <View style={styles.defaultTitleRow}>
                      <Ionicons name="medical-outline" size={22} color="#2F6690" />
                      <Text style={styles.defaultTitle}>{item.medicineName}</Text>
                    </View>

                    <TouchableOpacity activeOpacity={0.8}>
                      <Ionicons name="close" size={20} color="#98A2B3" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.metaText}>
                    Дозировка: {item.dosage} {item.unit}
                  </Text>
                  <Text style={styles.metaText}>Время приёма: {item.intakeTime}</Text>
                  <Text style={styles.metaText}>Тип: {item.medicationType}</Text>
                  <Text style={styles.metaText}>Причина: {item.reason}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'food' && (
            <View style={styles.blockList}>
              {food.map((item) => (
                <View key={item.id} style={styles.defaultCard}>
                  <View style={styles.defaultHeader}>
                    <View style={styles.defaultTitleRow}>
                      <Ionicons
                        name="restaurant-outline"
                        size={22}
                        color={item.reactionOccurred ? '#E63946' : '#2F6690'}
                      />
                      <Text style={styles.defaultTitle}>{item.foodName}</Text>
                    </View>

                    <TouchableOpacity activeOpacity={0.8}>
                      <Ionicons name="close" size={20} color="#98A2B3" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.metaText}>Категория: {item.category}</Text>
                  <Text style={styles.metaText}>
                    Количество: {item.amount} {item.unit}
                  </Text>
                  <Text style={styles.metaText}>Время: {item.intakeTime}</Text>

                  <View
                    style={[
                      styles.reactionBadge,
                      {
                        backgroundColor: item.reactionOccurred ? '#FCEBED' : '#EAF8F0',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.reactionBadgeText,
                        { color: item.reactionOccurred ? '#E63946' : '#2DCB70' },
                      ]}>
                      {item.reactionOccurred ? 'Есть реакция' : 'Реакции нет'}
                    </Text>
                  </View>

                  {!!item.reactionDescription && (
                    <Text style={styles.metaText}>
                      Описание реакции: {item.reactionDescription}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {activeTab === 'notes' && (
            <View style={styles.blockList}>
              {notes.map((item) => (
                <View key={item.id} style={styles.noteCard}>
                  <View style={styles.defaultHeader}>
                    <Text style={styles.defaultTitle}>{item.title}</Text>

                    <TouchableOpacity activeOpacity={0.8}>
                      <Ionicons name="close" size={20} color="#98A2B3" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.noteContent}>{item.content}</Text>
                  <Text style={styles.noteDate}>{item.createdAt}</Text>
                </View>
              ))}
            </View>
          )}
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
  tabsRow: {
    paddingBottom: 4,
    gap: 10,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#EAF1F7',
  },
  tabButtonActive: {
    backgroundColor: '#2F6690',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F6690',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginTop: 16,
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
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#233142',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 15,
    color: '#2F6690',
    fontWeight: '600',
  },
  blockList: {
    gap: 14,
  },
  commonCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  commonDate: {
    fontSize: 14,
    color: '#667085',
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  scoreBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  commonComment: {
    fontSize: 15,
    color: '#344054',
    lineHeight: 22,
    marginTop: 2,
  },
  symptomCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symptomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symptomIcon: {
    marginRight: 10,
  },
  symptomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#233142',
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 14,
  },
  statusTag: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  defaultCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  defaultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  defaultTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#233142',
    flex: 1,
  },
  metaText: {
    fontSize: 15,
    color: '#5B6776',
    lineHeight: 22,
    marginTop: 3,
  },
  reactionBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    marginBottom: 2,
  },
  reactionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: '#FBFBFD',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  noteContent: {
    fontSize: 15,
    color: '#344054',
    lineHeight: 22,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 13,
    color: '#98A2B3',
  },
});