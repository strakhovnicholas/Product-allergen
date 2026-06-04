import { ScreenSafeArea } from '../../components/ScreenSafeArea';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getUserProfileApi, type Profile } from '../../src/api/profileApi';
import { useAuth } from '../../src/context/AuthContext';
import { CHRONIC_DISEASE_LABELS, COLORS, withAlpha } from '../../src/styles/palette';

function formatBoolean(value?: boolean) {
  if (value === true) return 'Да';
  if (value === false) return 'Нет';
  return '—';
}

function predispositionLabel(value?: string) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'HIGH') return 'Высокая';
  if (normalized === 'MEDIUM') return 'Средняя';
  if (normalized === 'LOW') return 'Низкая';
  if (normalized === 'NONE') return 'Нет';
  return 'Не указана';
}

function predispositionColor(value?: string) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'HIGH') return COLORS.danger;
  if (normalized === 'MEDIUM') return COLORS.warning;
  if (normalized === 'LOW' || normalized === 'NONE') return COLORS.success;
  return '#64748B';
}

function genderLabel(value?: string) {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'MALE') return 'Мужской';
  if (normalized === 'FEMALE') return 'Женский';
  return null;
}

function lifestyleTone(type: 'smoker' | 'alcohol' | 'sports', value?: boolean) {
  if (typeof value !== 'boolean') return '#94A3B8';
  const healthy =
    (type === 'sports' && value) || ((type === 'smoker' || type === 'alcohol') && !value);
  return healthy ? COLORS.success : COLORS.danger;
}

function ProfileBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EditRow({
  icon,
  iconColor,
  title,
  hint,
  onPress,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  hint?: string;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.editRow} activeOpacity={0.88} onPress={onPress}>
      <View style={[styles.editRowIcon, { backgroundColor: withAlpha(iconColor, 0.1) }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.editRowBody}>
        <View style={styles.editRowHead}>
          <Text style={styles.editRowTitle}>{title}</Text>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </View>
        {!!hint && <Text style={styles.editRowHint}>{hint}</Text>}
        {children}
      </View>
    </TouchableOpacity>
  );
}

function TagList({
  items,
  emptyLabel,
  accentColor,
}: {
  items: string[];
  emptyLabel: string;
  accentColor: string;
}) {
  if (!items.length) {
    return <Text style={styles.emptyTags}>{emptyLabel}</Text>;
  }
  return (
    <View style={styles.tagList}>
      {items.map((item) => (
        <View
          key={item}
          style={[styles.tag, { backgroundColor: withAlpha(accentColor, 0.08) }]}
        >
          <Text style={[styles.tagText, { color: accentColor }]} numberOfLines={1}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function LifestyleTile({
  icon,
  label,
  value,
  tone,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tone: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.lifeTile} activeOpacity={0.88} onPress={onPress}>
      <View style={[styles.lifeTileIcon, { backgroundColor: withAlpha(tone, 0.1) }]}>
        <Ionicons name={icon} size={20} color={tone} />
      </View>
      <Text style={styles.lifeTileLabel}>{label}</Text>
      <Text style={[styles.lifeTileValue, { color: tone }]}>{value}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
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
        error instanceof Error ? error.message : 'Не удалось загрузить профиль',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  const openEdit = () => router.push('/edit-profile' as any);

  const allergyList = useMemo(
    () => (Array.isArray(profile?.allergies) ? profile.allergies.filter(Boolean) : []),
    [profile],
  );

  const chronicList = useMemo(() => {
    const raw = Array.isArray(profile?.chronicDiseases)
      ? profile.chronicDiseases.filter(Boolean)
      : [];
    return raw.map((item) => CHRONIC_DISEASE_LABELS[item] ?? item);
  }, [profile]);

  const predisposition = predispositionLabel(profile?.predisposition);
  const predispositionAccent = predispositionColor(profile?.predisposition);
  const gender = genderLabel(profile?.gender);

  const metrics = useMemo(
    () => [
      { label: 'Возраст', value: typeof profile?.age === 'number' ? `${profile.age}` : '—', unit: 'лет' },
      { label: 'Вес', value: typeof profile?.weight === 'number' ? `${profile.weight}` : '—', unit: 'кг' },
      { label: 'Рост', value: typeof profile?.height === 'number' ? `${profile.height}` : '—', unit: 'см' },
    ],
    [profile],
  );

  const handleLogout = async () => {
    try {
      setLogoutSubmitting(true);
      await logout();
      router.replace('/login' as any);
    } catch {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
    } finally {
      setLogoutSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenSafeArea style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void loadProfile(true)} />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>
                {(profile?.fullName?.trim()?.[0] ?? 'П').toUpperCase()}
              </Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName} numberOfLines={2}>
                {profile?.fullName?.trim() || 'Пользователь'}
              </Text>
              {!!gender && <Text style={styles.heroMeta}>{gender}</Text>}
              <View
                style={[
                  styles.riskPill,
                  { backgroundColor: withAlpha(predispositionAccent, 0.25) },
                ]}
              >
                <Ionicons name="pulse" size={12} color="#FFFFFF" />
                <Text style={styles.riskPillText}>Риск: {predisposition}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metricsRow}>
            {metrics.map((item) => (
              <View key={item.label} style={styles.metricCell}>
                <Text style={styles.metricLabel}>{item.label}</Text>
                <Text style={styles.metricValue}>
                  {item.value}
                  {item.value !== '—' ? (
                    <Text style={styles.metricUnit}> {item.unit}</Text>
                  ) : null}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.heroEditBtn} activeOpacity={0.9} onPress={openEdit}>
            <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            <Text style={styles.heroEditText}>Редактировать профиль</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ProfileBlock title="Здоровье">
          <EditRow
            icon="alert-circle-outline"
            iconColor={COLORS.danger}
            title="Аллергии"
            hint={
              allergyList.length
                ? `${allergyList.length} ${allergyList.length === 1 ? 'запись' : 'записей'}`
                : 'Не указаны'
            }
            onPress={openEdit}
          >
            <TagList
              items={allergyList}
              emptyLabel="Добавьте аллергии при редактировании"
              accentColor={COLORS.danger}
            />
          </EditRow>

          <View style={styles.rowDivider} />

          <EditRow
            icon="medkit-outline"
            iconColor={COLORS.primary}
            title="Хронические заболевания"
            hint={
              chronicList.length
                ? `${chronicList.length} ${chronicList.length === 1 ? 'запись' : 'записей'}`
                : 'Не указаны'
            }
            onPress={openEdit}
          >
            <TagList
              items={chronicList}
              emptyLabel="Нет хронических заболеваний"
              accentColor={COLORS.primary}
            />
          </EditRow>

          <View style={styles.rowDivider} />

          <EditRow
            icon="shield-checkmark-outline"
            iconColor={predispositionAccent}
            title="Предрасположенность"
            onPress={openEdit}
          >
            <View
              style={[
                styles.inlineBadge,
                { backgroundColor: withAlpha(predispositionAccent, 0.1) },
              ]}
            >
              <Text style={[styles.inlineBadgeText, { color: predispositionAccent }]}>
                {predisposition}
              </Text>
            </View>
          </EditRow>
        </ProfileBlock>

        <ProfileBlock title="Образ жизни">
          <View style={styles.lifeRow}>
            <LifestyleTile
              icon="flame-outline"
              label="Курение"
              value={formatBoolean(profile?.smoker)}
              tone={lifestyleTone('smoker', profile?.smoker)}
              onPress={openEdit}
            />
            <LifestyleTile
              icon="wine-outline"
              label="Алкоголь"
              value={formatBoolean(profile?.alcohol)}
              tone={lifestyleTone('alcohol', profile?.alcohol)}
              onPress={openEdit}
            />
            <LifestyleTile
              icon="fitness-outline"
              label="Спорт"
              value={formatBoolean(profile?.sports)}
              tone={lifestyleTone('sports', profile?.sports)}
              onPress={openEdit}
            />
          </View>
        </ProfileBlock>

        <TouchableOpacity
          style={[styles.logoutBtn, logoutSubmitting && styles.logoutBtnDisabled]}
          onPress={handleLogout}
          activeOpacity={0.85}
          disabled={logoutSubmitting}
        >
          {logoutSubmitting ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
              <Text style={styles.logoutText}>Выйти из аккаунта</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenSafeArea>
  );
}

const cardShadow = Platform.select({
  android: {
    elevation: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8EDF3',
  },
  default: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgSecondary,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 120,
    maxWidth: 860,
    width: '100%',
    alignSelf: 'center',
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  hero: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    backgroundColor: COLORS.heroStart,
    overflow: 'hidden',
    ...Platform.select({
      android: { elevation: 0 },
      default: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.2,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
    }),
  },
  heroGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FFFFFF18',
    top: -50,
    right: -40,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF30',
    borderWidth: 2,
    borderColor: '#FFFFFF55',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroInfo: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  heroMeta: {
    fontSize: 13,
    color: '#DDEAF8',
  },
  riskPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  riskPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricCell: {
    flex: 1,
    backgroundColor: '#FFFFFF22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFFFFF35',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  metricLabel: {
    fontSize: 11,
    color: '#DDEAF8',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DDEAF8',
  },
  heroEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  heroEditText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },

  block: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    ...cardShadow,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },

  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  editRowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editRowBody: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  editRowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  editRowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  editRowHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EEF2F6',
    marginVertical: 12,
    marginLeft: 54,
  },

  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyTags: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },

  inlineBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  lifeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  lifeTile: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 6,
  },
  lifeTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lifeTileLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  lifeTileValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  logoutBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E3F4',
  },
  logoutBtnDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
