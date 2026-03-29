import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../src/context/AuthContext';

const profileInfo = [
  {
    id: 1,
    label: 'ФИО',
    value: 'Киреев Михаил Валериевич',
    icon: 'person-outline',
  },
  {
    id: 2,
    label: 'Возраст',
    value: '23 год',
    icon: 'calendar-outline',
  },
  {
    id: 3,
    label: 'Вес',
    value: '82 кг',
    icon: 'barbell-outline',
  },
  {
    id: 4,
    label: 'Рост',
    value: '180 см',
    icon: 'resize-outline',
  },
];

const lifeStyle = [
  {
    id: 1,
    title: 'Курение',
    value: 'Нет',
    color: '#2DCB70',
    bg: '#EAF8F0',
  },
  {
    id: 2,
    title: 'Алкоголь',
    value: 'Редко',
    color: '#D4A017',
    bg: '#FCF8E8',
  },
  {
    id: 3,
    title: 'Спорт',
    value: 'Да',
    color: '#2F6690',
    bg: '#EAF1F7',
  },
  {
    id: 4,
    title: 'Наследственность',
    value: 'Есть',
    color: '#E63946',
    bg: '#FCEBED',
  },
];

export default function ProfileScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth' as any);
    } catch (error) {
      console.log('Ошибка выхода:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={42} color="#FFFFFF" />
          </View>

          <Text style={styles.userName}>Киреев Михаил Валериевич</Text>
          <Text style={styles.userEmail}>mikhail@example.com</Text>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={() => router.push('/edit-profile' as any)}>
            <Ionicons name="create-outline" size={18} color="#2F6690" />
            <Text style={styles.editButtonText}>Редактировать профиль</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Основная информация</Text>

          <View style={styles.infoList}>
            {profileInfo.map((item) => (
              <View key={item.id} style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons name={item.icon as any} size={20} color="#2F6690" />
                  </View>

                  <View>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Образ жизни</Text>

          <View style={styles.tagsGrid}>
            {lifeStyle.map((item) => (
              <View key={item.id} style={[styles.tagCard, { backgroundColor: item.bg }]}>
                <Text style={styles.tagTitle}>{item.title}</Text>
                <Text style={[styles.tagValue, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
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
  topSection: {
    backgroundColor: '#2F6690',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#78A6C8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF33',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    color: '#DCEAF5',
    marginBottom: 18,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2F6690',
  },
  cardSection: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 18,
  },
  infoList: {
    gap: 14,
  },
  infoRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#667085',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tagCard: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  tagTitle: {
    fontSize: 14,
    color: '#344054',
    marginBottom: 8,
    fontWeight: '500',
  },
  tagValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#E63946',
    borderRadius: 18,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});