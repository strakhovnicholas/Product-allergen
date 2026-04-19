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

import { getUserProfileApi } from '../../src/api/profileApi';
import { useAuth } from '../../src/context/AuthContext';

function formatBoolean(value?: boolean) {
  if (value === true) return 'Да';
  if (value === false) return 'Нет';
  return 'Не указано';
}

export default function ProfileScreen() {
  const { logout } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);

  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getUserProfileApi();

      console.log('PROFILE DATA:', data); // 🔥 лог для проверки

      setProfile(data ?? null);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось загрузить профиль'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile])
  );

  const profileInfo = useMemo(() => {
    return [
      {
        id: 1,
        label: 'ФИО',
        value: profile?.fullName?.trim() || 'Не указано',
        icon: 'person-outline',
      },
      {
        id: 2,
        label: 'Возраст',
        value:
          typeof profile?.age === 'number'
            ? `${profile.age} лет`
            : 'Не указано',
        icon: 'calendar-outline',
      },
      {
        id: 3,
        label: 'Вес',
        value:
          typeof profile?.weight === 'number'
            ? `${profile.weight} кг`
            : 'Не указано',
        icon: 'barbell-outline',
      },
      {
        id: 4,
        label: 'Рост',
        value:
          typeof profile?.height === 'number'
            ? `${profile.height} см`
            : 'Не указано',
        icon: 'resize-outline',
      },
    ];
  }, [profile]);

  const lifeStyle = useMemo(() => {
    return [
      {
        id: 1,
        title: 'Курение',
        value: formatBoolean(profile?.smoker), // ✅ FIX
        color: '#2DCB70',
        bg: '#EAF8F0',
      },
      {
        id: 2,
        title: 'Алкоголь',
        value: formatBoolean(profile?.alcohol),
        color: '#D4A017',
        bg: '#FCF8E8',
      },
      {
        id: 3,
        title: 'Спорт',
        value: formatBoolean(profile?.sports), // ✅ FIX
        color: '#2F6690',
        bg: '#EAF1F7',
      },
    ];
  }, [profile]);

  const handleLogout = async () => {
    try {
      setLogoutSubmitting(true);
      await logout();
      router.replace('/login' as any);
    } catch (error) {
      console.log('Ошибка выхода:', error);
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
    } finally {
      setLogoutSubmitting(false);
    }
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
            onRefresh={() => {
              void loadProfile(true);
            }}
          />
        }
      >
        <View style={styles.topSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={42} color="#FFFFFF" />
          </View>

          <Text style={styles.userName}>
            {profile?.fullName?.trim() || 'Пользователь'}
          </Text>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={() => router.push('/edit-profile' as any)}
          >
            <Ionicons name="create-outline" size={18} color="#2F6690" />
            <Text style={styles.editButtonText}>
              Редактировать профиль
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Основная информация</Text>

          <View style={styles.infoList}>
            {profileInfo.map((item) => (
              <View key={item.id} style={styles.infoRow}>
                <View style={styles.infoLeft}>
                  <View style={styles.infoIconWrap}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color="#2F6690"
                    />
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
              <View
                key={item.id}
                style={[styles.tagCard, { backgroundColor: item.bg }]}
              >
                <Text style={styles.tagTitle}>{item.title}</Text>
                <Text style={[styles.tagValue, { color: item.color }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            logoutSubmitting && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={logoutSubmitting}
        >
          {logoutSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutText}>
                Выйти из аккаунта
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F7' },
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  contentContainer: { padding: 16, paddingBottom: 120 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

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
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
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
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 18,
  },

  infoList: { gap: 14 },

  infoRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
  },

  infoLeft: { flexDirection: 'row', alignItems: 'center' },

  infoIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF1F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoLabel: { fontSize: 13, color: '#667085' },
  infoValue: { fontSize: 16, fontWeight: '700' },

  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  tagCard: {
    width: '48%',
    borderRadius: 18,
    padding: 18,
  },

  tagTitle: { fontSize: 14 },
  tagValue: { fontSize: 20, fontWeight: '700' },

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

  logoutButtonDisabled: { opacity: 0.7 },
});