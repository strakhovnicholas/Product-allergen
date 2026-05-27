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
  useWindowDimensions,
  View,
} from 'react-native';

import { getUserProfileApi } from '../../src/api/profileApi';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/styles/palette';
import { FONT, SPACING } from '../../src/styles/theme';

function formatBoolean(value?: boolean) {
  if (value === true) return 'Да';
  if (value === false) return 'Нет';
  return 'Не указано';
}

function getLifestyleStatusColor(type: 'smoker' | 'alcohol' | 'sports', value?: boolean) {
  if (typeof value !== 'boolean') return '#64748B';

  const isHealthyChoice =
    (type === 'sports' && value === true) ||
    ((type === 'smoker' || type === 'alcohol') && value === false);

  return isHealthyChoice ? '#16A34A' : '#DC2626';
}

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
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

  const lifeStyle = useMemo(() => {
    return [
      {
        id: 1,
        title: 'Курение',
        value: formatBoolean(profile?.smoker),
        subtitle: 'Табачные привычки',
        icon: 'flame-outline',
        iconColor: '#F59E0B',
        statusColor: getLifestyleStatusColor('smoker', profile?.smoker),
      },
      {
        id: 2,
        title: 'Алкоголь',
        value: formatBoolean(profile?.alcohol),
        subtitle: 'Употребление алкоголя',
        icon: 'wine-outline',
        iconColor: '#BE123C',
        statusColor: getLifestyleStatusColor('alcohol', profile?.alcohol),
      },
      {
        id: 3,
        title: 'Спорт',
        value: formatBoolean(profile?.sports),
        subtitle: 'Физическая активность',
        icon: 'fitness-outline',
        iconColor: '#16A34A',
        statusColor: getLifestyleStatusColor('sports', profile?.sports),
      },
    ];
  }, [profile]);

  const keyFacts = useMemo(() => {
    return [
      {
        id: 'age',
        label: 'Возраст',
        value:
          typeof profile?.age === 'number'
            ? `${profile.age}`
            : '--',
        unit: 'лет',
        icon: 'calendar-outline',
        color: '#FFFFFF',
        bg: '#FFFFFF2B',
      },
      {
        id: 'weight',
        label: 'Вес',
        value:
          typeof profile?.weight === 'number'
            ? `${profile.weight}`
            : '--',
        unit: 'кг',
        icon: 'barbell-outline',
        color: '#FFFFFF',
        bg: '#FFFFFF2B',
      },
      {
        id: 'height',
        label: 'Рост',
        value:
          typeof profile?.height === 'number'
            ? `${profile.height}`
            : '--',
        unit: 'см',
        icon: 'resize-outline',
        color: '#FFFFFF',
        bg: '#FFFFFF2B',
      },
    ];
  }, [profile]);

  const allergyList = useMemo(() => {
    return Array.isArray(profile?.allergies) ? profile.allergies.filter(Boolean) : [];
  }, [profile]);

  const chronicList = useMemo(() => {
    return Array.isArray(profile?.chronicDiseases) ? profile.chronicDiseases.filter(Boolean) : [];
  }, [profile]);

  const predispositionLabel = useMemo(() => {
    const value = String(profile?.predisposition || '').toUpperCase();
    if (value === 'HIGH') return 'Высокая';
    if (value === 'MEDIUM') return 'Средняя';
    if (value === 'LOW') return 'Низкая';
    if (value === 'NONE') return 'Отсутствует';
    return 'Не указана';
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
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { maxWidth: 860, width: Math.min(width - 20, 860), alignSelf: 'center' },
        ]}
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
        <View style={styles.profileHero}>
          <View style={styles.heroTop}>
            <View style={styles.heroUserBlock}>
              <View style={styles.heroIconWrap}>
                <Ionicons name="person-outline" size={22} color={COLORS.textInverse} />
              </View>
              <View style={styles.profileTitleWrap}>
                <Text style={styles.userName}>
                  {profile?.fullName?.trim() || 'Пользователь'}
                </Text>
                <Text style={styles.profileMetaText}>
                  Профиль здоровья
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.heroEditRoundButton}
              activeOpacity={0.85}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Ionicons name="create-outline" size={24} color={COLORS.textInverse} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroFactsCard}>
            <View style={styles.heroFactsHead}>
              <Ionicons name="grid-outline" size={17} color="#DDEAF8" />
              <Text style={styles.heroFactsTitle}>Ключевые показатели</Text>
            </View>
            <View style={[styles.factsGrid, isCompact && styles.factsGridCompact]}>
              {keyFacts.map((fact) => (
                <View key={fact.id} style={styles.heroFactItem}>
                  <View style={styles.heroFactTopRow}>
                    <View style={[styles.heroFactIconWrap, { backgroundColor: fact.bg }]}>
                      <Ionicons name={fact.icon as any} size={15} color={fact.color} />
                    </View>
                    <Text style={[styles.heroFactValue, { color: fact.color }]}>
                      {fact.value}
                    </Text>
                  </View>
                  <Text style={styles.factLabel}>{fact.label}</Text>
                  <View style={styles.factValueRow}>
                    <Text style={styles.factUnit}>{fact.unit}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.splitRow, isCompact && styles.splitRowCompact]}>
          <View style={[styles.cardSection, styles.splitCard, isCompact && styles.splitCardCompact]}>
            <View style={styles.sectionHead}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Особенности здоровья</Text>
            </View>
            <View style={styles.healthList}>
              <View style={styles.healthInfoRow}>
                <View style={styles.healthInfoLeft}>
                  <Text style={styles.healthInfoLabel}>Аллергии</Text>
                  <Text style={styles.healthInfoDetail}>
                    {allergyList.length ? allergyList.join(', ') : 'Не указаны'}
                  </Text>
                </View>
                <Text style={styles.healthInfoValue}>{allergyList.length}</Text>
              </View>
              <View style={styles.healthInfoRow}>
                <View style={styles.healthInfoLeft}>
                  <Text style={styles.healthInfoLabel}>Хронические</Text>
                  <Text style={styles.healthInfoDetail}>
                    {chronicList.length ? chronicList.join(', ') : 'Не указаны'}
                  </Text>
                </View>
                <Text style={styles.healthInfoValue}>{chronicList.length}</Text>
              </View>
              <View style={styles.healthInfoRow}>
                <View style={styles.healthInfoLeft}>
                  <Text style={styles.healthInfoLabel}>Предрасположенность</Text>
                  <Text style={styles.healthInfoDetail}>Уровень риска: {predispositionLabel}</Text>
                </View>
                <Text style={styles.healthInfoValue}>{predispositionLabel}</Text>
              </View>
            </View>
            <Text style={styles.healthNoteText}>
              Следите за записями в дневнике - так проще замечать триггеры и динамику.
            </Text>
          </View>

          <View style={[styles.cardSection, styles.splitCard, isCompact && styles.splitCardCompact]}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionEmoji}>⚕️</Text>
              <Text style={styles.sectionTitle}>Образ жизни</Text>
            </View>
            <View style={styles.lifestyleStack}>
              {lifeStyle.map((item) => (
                <View key={item.id} style={styles.lifestyleCard}>
                  <View style={styles.lifestyleTopRow}>
                    <View style={[styles.lifestyleIconWrap, { backgroundColor: `${item.iconColor}1F` }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                    </View>
                    <Text style={[styles.lifestyleValue, { color: item.statusColor }]}>
                      {item.value}
                    </Text>
                  </View>
                  <Text style={styles.tagTitle}>{item.title}</Text>
                  <Text style={styles.lifestyleSubtitle}>{item.subtitle}</Text>
                </View>
              ))}
            </View>
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
            <ActivityIndicator color={COLORS.textInverse} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={COLORS.textInverse} />
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
  safeArea: { flex: 1, backgroundColor: COLORS.bgPrimary },
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  contentContainer: { width: '100%', paddingHorizontal: SPACING.sm - 2, paddingTop: SPACING.sm, paddingBottom: 120 },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileHero: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: 18,
    marginBottom: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heroUserBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  heroIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF2B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileTitleWrap: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: 4,
  },
  profileMetaText: {
    fontSize: FONT.body,
    color: '#DDEAF8',
  },
  heroEditRoundButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF26',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heroFactsCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#60A5FA',
    padding: 14,
  },
  heroFactsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  heroFactsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#233142',
  },
  sectionEmoji: {
    width: 20,
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 20,
    color: '#1D4ED8',
  },

  factsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  factsGridCompact: {
    flexDirection: 'column',
    gap: 8,
  },
  heroFactItem: {
    flex: 1,
    backgroundColor: '#FFFFFF1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF33',
    paddingVertical: 12,
    paddingHorizontal: 12,
    minHeight: 98,
  },
  heroFactTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroFactIconWrap: {
    width: 34,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFactValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  factLabel: {
    fontSize: 14,
    color: '#DDEAF8',
    fontWeight: '600',
    marginBottom: 3,
  },
  factValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  factUnit: {
    fontSize: 12,
    color: '#BFD0FF',
  },

  splitRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  splitRowCompact: {
    flexDirection: 'column',
    gap: 0,
  },
  splitCard: {
    flex: 1,
  },
  splitCardCompact: {
    marginTop: 14,
  },
  lifestyleStack: {
    gap: 8,
  },
  lifestyleCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6ECF4',
    backgroundColor: '#FFFFFF',
    minHeight: 104,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  lifestyleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lifestyleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagTitle: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
    lineHeight: 20,
  },
  lifestyleSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  lifestyleValue: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },

  healthList: {
    gap: 10,
  },
  healthInfoRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6ECF4',
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthInfoLeft: {
    flex: 1,
    paddingRight: 10,
  },
  healthInfoLabel: {
    fontSize: 14,
    color: '#475467',
    fontWeight: '600',
  },
  healthInfoDetail: {
    marginTop: 4,
    fontSize: 12,
    color: '#667085',
    lineHeight: 16,
  },
  healthInfoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D4ED8',
    maxWidth: 130,
    textAlign: 'right',
  },
  healthNoteText: {
    marginTop: 10,
    fontSize: FONT.caption,
    color: COLORS.textMuted,
    lineHeight: 18,
  },

  logoutButton: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: COLORS.textInverse,
    fontSize: FONT.body,
    fontWeight: '700',
  },
  logoutButtonDisabled: { opacity: 0.7 },
});