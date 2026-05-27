import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';

import {
    analyzeFoodAndSymptomsApi,
    CommonFeeling,
    Food,
    FoodComponentSymptomsResponse,
    getCommonFeelingsApi,
    getFoodApi,
    getSymptomsApi,
    Symptom,
} from '../../src/api/diaryApi';
import { generateReportApi } from '../../src/api/reportApi';

function toSafePercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function average(numbers: number[]) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function isValidDateValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function toStartOfDayIso(value: string) {
  return `${value}T00:00:00`;
}

function toEndOfDayIso(value: string) {
  return `${value}T23:59:59`;
}

function getRangeFromData(
  foods: Food[],
  feelings: CommonFeeling[],
  symptoms: Symptom[]
) {
  const dates = [
    ...foods.map((item) => item.intakeTime),
    ...feelings.map((item) => item.dateTime),
    ...symptoms.map((item) => item.startTime),
  ].filter(Boolean);

  if (dates.length === 0) {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(now.getDate() - 30);

    return {
      from: monthAgo.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10),
    };
  }

  const validDates = dates
    .map((item) => new Date(item))
    .filter((item) => !Number.isNaN(item.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const first = validDates[0];
  const last = validDates[validDates.length - 1];

  return {
    from: first.toISOString().slice(0, 10),
    to: last.toISOString().slice(0, 10),
  };
}

export default function ReportsScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(now.getDate() - 30);
    return monthAgo.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [periodTouched, setPeriodTouched] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [feelings, setFeelings] = useState<CommonFeeling[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [analyzerData, setAnalyzerData] = useState<FoodComponentSymptomsResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingPeriod, setApplyingPeriod] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const loadAnalyzerForPeriod = useCallback(async () => {
    if (!isValidDateValue(dateFrom) || !isValidDateValue(dateTo)) {
      setAnalyzerData([]);
      return;
    }
    if (new Date(toStartOfDayIso(dateFrom)) > new Date(toStartOfDayIso(dateTo))) {
      setAnalyzerData([]);
      return;
    }
    const analyzer = await analyzeFoodAndSymptomsApi(
      toStartOfDayIso(dateFrom),
      toEndOfDayIso(dateTo)
    ).catch(() => []);
    setAnalyzerData(analyzer ?? []);
  }, [dateFrom, dateTo]);

  const loadReportsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [foodsResult, feelingsResult, symptomsResult] =
        await Promise.allSettled([
          getFoodApi(),
          getCommonFeelingsApi(),
          getSymptomsApi(),
        ]);

      setFoods(foodsResult.status === 'fulfilled' ? foodsResult.value ?? [] : []);
      setFeelings(feelingsResult.status === 'fulfilled' ? feelingsResult.value ?? [] : []);
      setSymptoms(symptomsResult.status === 'fulfilled' ? symptomsResult.value ?? [] : []);
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить данные отчётов');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadReportsData();
    }, [loadReportsData])
  );

  const dateRange = useMemo(() => {
    return getRangeFromData(foods, feelings, symptoms);
  }, [foods, feelings, symptoms]);

  useEffect(() => {
    if (periodTouched) return;
    setDateFrom(dateRange.from);
    setDateTo(dateRange.to);
  }, [dateRange.from, dateRange.to, periodTouched]);

  useEffect(() => {
    if (loading) return;
    void loadAnalyzerForPeriod();
  }, [loading, loadAnalyzerForPeriod]);

  const periodError = useMemo(() => {
    if (!isValidDateValue(dateFrom) || !isValidDateValue(dateTo)) {
      return 'Введите период в формате YYYY-MM-DD.';
    }
    if (new Date(toStartOfDayIso(dateFrom)) > new Date(toStartOfDayIso(dateTo))) {
      return 'Дата начала не может быть позже даты окончания.';
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (new Date(toEndOfDayIso(dateFrom)) > today || new Date(toEndOfDayIso(dateTo)) > today) {
      return 'Период не может быть в будущем.';
    }
    return '';
  }, [dateFrom, dateTo]);

  const applyPeriod = useCallback(async () => {
    setPeriodTouched(true);
    if (periodError) {
      Alert.alert('Ошибка периода', periodError);
      return;
    }
    try {
      setApplyingPeriod(true);
      await loadAnalyzerForPeriod();
    } finally {
      setApplyingPeriod(false);
    }
  }, [loadAnalyzerForPeriod, periodError]);

  const handleGenerateReport = useCallback(async () => {
    setPeriodTouched(true);
    if (periodError) {
      Alert.alert('Ошибка периода', periodError);
      return;
    }

    try {
      setGeneratingReport(true);
      await generateReportApi(toStartOfDayIso(dateFrom), toEndOfDayIso(dateTo));
      Alert.alert('Готово', 'Генерация отчета запущена.');
    } catch (e) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось запустить генерацию отчета');
    } finally {
      setGeneratingReport(false);
    }
  }, [dateFrom, dateTo, periodError]);

  const dashboardStats = useMemo(() => {
    const totalFoodEntries = foods.length;
    const totalReactions = foods.filter((item) => item.reactionOccurred).length;
    const avgWellbeing = average(
      feelings
        .map((item) => item.wellbeingScore)
        .filter((value) => typeof value === 'number')
    );
    const avgMood = average(
      feelings
        .map((item) => item.mood)
        .filter((value): value is number => typeof value === 'number')
    );

    const groupedFood = new Map<
      string,
      { foodName: string; totalIntakes: number; reactions: number }
    >();

    foods.forEach((item) => {
      const key = item.foodName.trim().toLowerCase();
      if (!key) return;

      const existing = groupedFood.get(key);

      if (existing) {
        existing.totalIntakes += 1;
        if (item.reactionOccurred) existing.reactions += 1;
      } else {
        groupedFood.set(key, {
          foodName: item.foodName,
          totalIntakes: 1,
          reactions: item.reactionOccurred ? 1 : 0,
        });
      }
    });

    const products = Array.from(groupedFood.values());

    const riskySorted = [...products]
      .filter((item) => item.totalIntakes > 0 && item.reactions > 0)
      .map((item) => ({
        ...item,
        riskScore: item.reactions / item.totalIntakes,
      }))
      .sort((a, b) => b.riskScore - a.riskScore || b.reactions - a.reactions);

    const safeSorted = [...products]
      .filter((item) => item.totalIntakes > 0 && item.reactions === 0)
      .map((item) => ({
        ...item,
        safetyScore: 1 - item.reactions / item.totalIntakes,
      }))
      .sort((a, b) => b.safetyScore - a.safetyScore || b.totalIntakes - a.totalIntakes);

    return {
      totalFoodEntries,
      totalReactions,
      avgWellbeing,
      avgMood,
      mostRiskyFood: riskySorted[0]?.foodName ?? 'Нет данных',
      safestFood: safeSorted[0]?.foodName ?? 'Нет данных',
      safeFoods: safeSorted.slice(0, 5),
      dangerFoods: riskySorted.slice(0, 5),
    };
  }, [foods, feelings]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1D4ED8" />
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
          { width: '100%', maxWidth: 860, alignSelf: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadReportsData(true);
            }}
          />
        }
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="bar-chart-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Отчёты и аналитика</Text>
              <Text style={styles.heroSubtitle}>
                Сводка по реакциям, продуктам и симптомам за ваш период наблюдений.
              </Text>
            </View>
          </View>
          <View style={styles.heroPeriodCard}>
            <Text style={styles.heroPeriodLabel}>Период данных</Text>
            <View style={styles.periodInputRow}>
              <View style={styles.periodInputBox}>
                <Text style={styles.periodInputLabel}>С</Text>
                <TextInput
                  style={styles.periodInput}
                  value={dateFrom}
                  onChangeText={(value) => {
                    setPeriodTouched(true);
                    setDateFrom(value.trim());
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#BFD0FF"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.periodInputBox}>
                <Text style={styles.periodInputLabel}>По</Text>
                <TextInput
                  style={styles.periodInput}
                  value={dateTo}
                  onChangeText={(value) => {
                    setPeriodTouched(true);
                    setDateTo(value.trim());
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#BFD0FF"
                  autoCapitalize="none"
                />
              </View>
            </View>
            {periodError ? (
              <Text style={styles.periodErrorText}>{periodError}</Text>
            ) : (
              <Text style={styles.heroPeriodValue}>
                {dateFrom} - {dateTo}
              </Text>
            )}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={[styles.heroActionButton, applyingPeriod && styles.generateButtonDisabled]}
                disabled={applyingPeriod}
                onPress={() => {
                  void applyPeriod();
                }}
              >
                <Text style={styles.heroActionButtonText}>
                  {applyingPeriod ? 'Применяем...' : 'Применить период'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.heroActionButton,
                  styles.heroActionButtonPrimary,
                  generatingReport && styles.generateButtonDisabled,
                ]}
                disabled={generatingReport}
                onPress={() => {
                  void handleGenerateReport();
                }}
              >
                <Text style={styles.heroActionButtonPrimaryText}>
                  {generatingReport ? 'Генерируем...' : 'Сгенерировать отчет'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHead}>
            <Ionicons name="grid-outline" size={18} color="#1D4ED8" />
            <Text style={styles.sectionTitle}>Сводная статистика</Text>
          </View>

          <View style={styles.statsGrid}>
            {[
              {
                key: 'food',
                icon: 'restaurant-outline' as const,
                value: String(dashboardStats.totalFoodEntries),
                label: 'Записей еды',
                hint: 'за период',
                color: '#1D4ED8',
              },
              {
                key: 'react',
                icon: 'warning-outline' as const,
                value: String(dashboardStats.totalReactions),
                label: 'Реакций',
                hint: 'за период',
                color: '#E11D48',
              },
              {
                key: 'wellbeing',
                icon: 'heart-outline' as const,
                value: dashboardStats.avgWellbeing.toFixed(1),
                label: 'Среднее самочувствие',
                hint: 'по шкале 1-5',
                color: '#16A34A',
              },
              {
                key: 'mood',
                icon: 'sunny-outline' as const,
                value: dashboardStats.avgMood.toFixed(1),
                label: 'Среднее настроение',
                hint: 'по шкале 1-5',
                color: '#F59E0B',
              },
            ].map((item) => (
              <View key={item.key} style={[styles.statCard, isCompact && styles.statCardCompact]}>
                <View style={styles.statTopRow}>
                  <View style={[styles.statIconWrap, { backgroundColor: `${item.color}18` }]}>
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                </View>
                <Text style={styles.statLabel}>{item.label}</Text>
                <Text style={styles.statHint}>{item.hint}</Text>
              </View>
            ))}
          </View>

          <View style={styles.highlightList}>
            <View style={styles.highlightRow}>
              <Ionicons name="warning-outline" size={20} color="#E11D48" />
              <Text style={styles.highlightText}>
                Самый рискованный продукт:{' '}
                <Text style={styles.highlightStrong}>
                  {dashboardStats.mostRiskyFood}
                </Text>
              </Text>
            </View>

            <View style={styles.highlightRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#22C55E"
              />
              <Text style={styles.highlightText}>
                Самый безопасный продукт:{' '}
                <Text style={styles.highlightStrong}>
                  {dashboardStats.safestFood}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHead}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#22C55E" />
            <Text style={styles.sectionTitle}>Безопасные продукты</Text>
          </View>

          <View style={styles.list}>
            {dashboardStats.safeFoods.length === 0 ? (
              <Text style={styles.emptyText}>
                Пока недостаточно данных по продуктам.
              </Text>
            ) : (
              dashboardStats.safeFoods.map((item) => (
                <View key={item.foodName} style={[styles.listCard, styles.safeListCard]}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{item.foodName}</Text>
                    <View
                      style={[
                        styles.scoreBadge,
                        { backgroundColor: '#EAF8F0' },
                      ]}
                    >
                      <Text style={[styles.scoreText, { color: '#22C55E' }]}>
                        {toSafePercent(item.safetyScore)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.metaText}>
                    Употреблений: {item.totalIntakes}
                  </Text>
                  <Text style={styles.metaText}>
                    Реакций: {item.reactions}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHead}>
            <Ionicons name="warning-outline" size={18} color="#E11D48" />
            <Text style={styles.sectionTitle}>Опасные продукты</Text>
          </View>

          <View style={styles.list}>
            {dashboardStats.dangerFoods.length === 0 ? (
              <Text style={styles.emptyText}>
                Пока недостаточно данных по реакциям.
              </Text>
            ) : (
              dashboardStats.dangerFoods.map((item) => (
                <View key={item.foodName} style={[styles.listCard, styles.dangerListCard]}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{item.foodName}</Text>
                    <View
                      style={[
                        styles.scoreBadge,
                        { backgroundColor: '#FCEBED' },
                      ]}
                    >
                      <Text style={[styles.scoreText, { color: '#E11D48' }]}>
                        {toSafePercent(item.riskScore)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.metaText}>
                    Употреблений: {item.totalIntakes}
                  </Text>
                  <Text style={styles.metaText}>
                    Реакций: {item.reactions}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.sectionHead}>
            <Ionicons name="analytics-outline" size={18} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Анализ компонентов и симптомов</Text>
          </View>
          <View style={styles.dateBox}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Начало периода</Text>
              <Text style={styles.dateValue}>{dateRange.from}</Text>
            </View>

            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Конец периода</Text>
              <Text style={styles.dateValue}>{dateRange.to}</Text>
            </View>
          </View>
          <View style={styles.list}>
            {analyzerData.length === 0 ? (
              <Text style={styles.emptyText}>
                Недостаточно данных для анализа за выбранный период.
              </Text>
            ) : (
              analyzerData.map((item) => (
                <View key={item.foodComponentName} style={styles.reportCard}>
                  <Text style={styles.reportTitle}>{item.foodComponentName}</Text>
                  <Text style={styles.metaText}>
                    Связанные симптомы:{' '}
                    {item.symptomsName.length > 0
                      ? item.symptomsName.join(', ')
                      : 'не обнаружены'}
                  </Text>
                </View>
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
    backgroundColor: '#EEF4FF',
  },
  container: {
    flex: 1,
    backgroundColor: '#EEF4FF',
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 120,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: '#1D4ED8',
    borderRadius: 28,
    padding: 18,
    marginBottom: 4,
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
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
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#DDEAF8',
    lineHeight: 20,
  },
  heroPeriodCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroPeriodLabel: {
    color: '#DDEAF8',
    fontSize: 12,
    marginBottom: 2,
  },
  heroPeriodValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  periodInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  periodInputBox: {
    flex: 1,
  },
  periodInputLabel: {
    color: '#DDEAF8',
    fontSize: 12,
    marginBottom: 6,
  },
  periodInput: {
    backgroundColor: '#FFFFFF26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF3D',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  periodErrorText: {
    marginTop: 8,
    color: '#FEE2E2',
    fontSize: 12,
    fontWeight: '600',
  },
  heroActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  heroActionButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF1F',
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  heroActionButtonPrimary: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  heroActionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  heroActionButtonPrimaryText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
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
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#233142',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    minHeight: 104,
  },
  statCardCompact: {
    width: '100%',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 2,
  },
  statHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  highlightList: {
    marginTop: 18,
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#344054',
    lineHeight: 22,
  },
  highlightStrong: {
    fontWeight: '700',
    color: '#233142',
  },
  list: {
    gap: 12,
  },
  listCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    borderLeftWidth: 4,
    borderLeftColor: '#D7E3F4',
  },
  safeListCard: {
    borderLeftColor: '#22C55E',
  },
  dangerListCard: {
    borderLeftColor: '#E11D48',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
    flex: 1,
    paddingRight: 12,
  },
  scoreBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 14,
    color: '#667085',
    marginTop: 8,
  },
  smallLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 10,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  chip: {
    backgroundColor: '#DBEAFE',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: '#1D4ED8',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  formatRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  formatButton: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7E3F4',
  },
  formatButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  formatButtonText: {
    color: '#1D4ED8',
    fontSize: 15,
    fontWeight: '700',
  },
  formatButtonTextActive: {
    color: '#FFFFFF',
  },
  dateBox: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    gap: 12,
  },
  dateItem: {},
  dateLabel: {
    fontSize: 13,
    color: '#667085',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#233142',
  },
  generateButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  reportCard: {
    backgroundColor: '#F8FBFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  reportInfo: {
    flex: 1,
    paddingRight: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#233142',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 13,
    color: '#667085',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reportBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportFormat: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadButtonText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '700',
  },
  processingBox: {
    backgroundColor: '#FCF8E8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  processingText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#98A2B3',
    lineHeight: 20,
  },
});