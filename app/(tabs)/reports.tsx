import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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
  getSymptomsApi,
  Symptom,
} from '../../src/api/diaryApi';
import {
  GeneratedReport,
  generateReportApi,
  getGeneratedReportsApi,
  ReportFormat,
  ReportType,
} from '../../src/api/reportApi';

function reportTypeLabel(type: ReportType) {
  switch (type) {
    case 'SUMMARY':
      return 'Краткий отчёт';
    case 'DETAILED':
      return 'Подробный отчёт';
    case 'FOOD_ANALYSIS':
      return 'Анализ продуктов';
    case 'SYMPTOM_ANALYSIS':
      return 'Анализ симптомов';
    default:
      return type;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'READY':
      return 'Готов';
    case 'PROCESSING':
      return 'Обрабатывается';
    case 'FAILED':
      return 'Ошибка';
    default:
      return status;
  }
}

function statusColor(status: string) {
  switch (status) {
    case 'READY':
      return '#2DCB70';
    case 'PROCESSING':
      return '#D4A017';
    case 'FAILED':
      return '#E63946';
    default:
      return '#98A2B3';
  }
}

function isValidDate(value: string) {
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function toSafePercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function average(numbers: number[]) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleString('ru-RU');
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
  const [selectedType, setSelectedType] = useState<ReportType>('FOOD_ANALYSIS');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');

  const [foods, setFoods] = useState<Food[]>([]);
  const [feelings, setFeelings] = useState<CommonFeeling[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadReportsData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [foodsData, feelingsData, symptomsData, reportsData] =
        await Promise.all([
          getFoodApi(),
          getCommonFeelingsApi(),
          getSymptomsApi(),
          getGeneratedReportsApi().catch(() => []),
        ]);

      setFoods(foodsData ?? []);
      setFeelings(feelingsData ?? []);
      setSymptoms(symptomsData ?? []);
      setGeneratedReports(reportsData ?? []);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить данные отчётов'
      );
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
      .filter((item) => item.totalIntakes > 0)
      .map((item) => ({
        ...item,
        riskScore: item.reactions / item.totalIntakes,
      }))
      .sort((a, b) => b.riskScore - a.riskScore || b.reactions - a.reactions);

    const safeSorted = [...products]
      .filter((item) => item.totalIntakes > 0)
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

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);

      const payload = {
        reportType: selectedType,
        format: selectedFormat,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      };

      const createdReport = await generateReportApi(payload);

      Alert.alert(
        'Успешно',
        'Отчёт поставлен в очередь на генерацию'
      );

      setGeneratedReports((prev) => [createdReport, ...prev]);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error
          ? error.message
          : 'Не удалось запустить генерацию отчёта'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report: GeneratedReport) => {
    if (!report.downloadUrl) {
      Alert.alert('Информация', 'Ссылка на скачивание пока недоступна');
      return;
    }

    try {
      await Linking.openURL(report.downloadUrl);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть ссылку на скачивание');
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
              void loadReportsData(true);
            }}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Отчёты</Text>
          <Text style={styles.subtitle}>
            Анализ продуктов, реакций и генерация отчётов
          </Text>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Сводная статистика</Text>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#EAF1F7' }]}>
              <Text style={[styles.statValue, { color: '#2F6690' }]}>
                {dashboardStats.totalFoodEntries}
              </Text>
              <Text style={styles.statLabel}>Записей еды</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FCEBED' }]}>
              <Text style={[styles.statValue, { color: '#E63946' }]}>
                {dashboardStats.totalReactions}
              </Text>
              <Text style={styles.statLabel}>Реакций</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#EAF8F0' }]}>
              <Text style={[styles.statValue, { color: '#2DCB70' }]}>
                {dashboardStats.avgWellbeing.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Среднее самочувствие</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FCF8E8' }]}>
              <Text style={[styles.statValue, { color: '#D4A017' }]}>
                {dashboardStats.avgMood.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Среднее настроение</Text>
            </View>
          </View>

          <View style={styles.highlightList}>
            <View style={styles.highlightRow}>
              <Ionicons name="warning-outline" size={20} color="#E63946" />
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
                color="#2DCB70"
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
          <Text style={styles.sectionTitle}>Безопасные продукты</Text>

          <View style={styles.list}>
            {dashboardStats.safeFoods.length === 0 ? (
              <Text style={styles.emptyText}>
                Пока недостаточно данных по продуктам.
              </Text>
            ) : (
              dashboardStats.safeFoods.map((item) => (
                <View key={item.foodName} style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{item.foodName}</Text>
                    <View
                      style={[
                        styles.scoreBadge,
                        { backgroundColor: '#EAF8F0' },
                      ]}
                    >
                      <Text style={[styles.scoreText, { color: '#2DCB70' }]}>
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
          <Text style={styles.sectionTitle}>Опасные продукты</Text>

          <View style={styles.list}>
            {dashboardStats.dangerFoods.length === 0 ? (
              <Text style={styles.emptyText}>
                Пока недостаточно данных по реакциям.
              </Text>
            ) : (
              dashboardStats.dangerFoods.map((item) => (
                <View key={item.foodName} style={styles.listCard}>
                  <View style={styles.listHeader}>
                    <Text style={styles.listTitle}>{item.foodName}</Text>
                    <View
                      style={[
                        styles.scoreBadge,
                        { backgroundColor: '#FCEBED' },
                      ]}
                    >
                      <Text style={[styles.scoreText, { color: '#E63946' }]}>
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
          <Text style={styles.sectionTitle}>Сгенерировать отчёт</Text>

          <Text style={styles.smallLabel}>Тип отчёта</Text>
          <View style={styles.chipsRow}>
            {(
              ['SUMMARY', 'DETAILED', 'FOOD_ANALYSIS', 'SYMPTOM_ANALYSIS'] as ReportType[]
            ).map((type) => {
              const isActive = selectedType === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, isActive && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive && styles.chipTextActive,
                    ]}
                  >
                    {reportTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.smallLabel}>Формат</Text>
          <View style={styles.formatRow}>
            {(['PDF', 'DOCX'] as ReportFormat[]).map((format) => {
              const isActive = selectedFormat === format;

              return (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.formatButton,
                    isActive && styles.formatButtonActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedFormat(format)}
                >
                  <Text
                    style={[
                      styles.formatButtonText,
                      isActive && styles.formatButtonTextActive,
                    ]}
                  >
                    {format}
                  </Text>
                </TouchableOpacity>
              );
            })}
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

          <TouchableOpacity
            style={[
              styles.generateButton,
              generating && styles.generateButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleGenerateReport}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="file-chart-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.generateButtonText}>
                  Сгенерировать отчёт
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Последние отчёты</Text>

          <View style={styles.list}>
            {generatedReports.length === 0 ? (
              <Text style={styles.emptyText}>
                Отчётов пока нет. Сгенерируйте первый отчёт.
              </Text>
            ) : (
              generatedReports.map((item) => (
                <View key={item.id} style={styles.reportCard}>
                  <View style={styles.reportTop}>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle}>
                        {reportTypeLabel(item.reportType)}
                      </Text>
                      <Text style={styles.reportDate}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: `${statusColor(item.status)}18`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColor(item.status) },
                        ]}
                      >
                        {statusLabel(item.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reportBottom}>
                    <Text style={styles.reportFormat}>{item.format}</Text>

                    {item.status === 'READY' ? (
                      <TouchableOpacity
                        style={styles.downloadButton}
                        activeOpacity={0.85}
                        onPress={() => {
                          void handleDownload(item);
                        }}
                      >
                        <Ionicons
                          name="download-outline"
                          size={18}
                          color="#2F6690"
                        />
                        <Text style={styles.downloadButtonText}>Скачать</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.processingBox}>
                        <Text style={styles.processingText}>
                          Ожидайте завершения
                        </Text>
                      </View>
                    )}
                  </View>
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
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#344054',
    fontWeight: '500',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
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
    backgroundColor: '#EAF1F7',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: '#2F6690',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F6690',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  formatButtonActive: {
    backgroundColor: '#2F6690',
    borderColor: '#2F6690',
  },
  formatButtonText: {
    color: '#2F6690',
    fontSize: 15,
    fontWeight: '700',
  },
  formatButtonTextActive: {
    color: '#FFFFFF',
  },
  dateBox: {
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#2F6690',
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
    backgroundColor: '#F8FAFC',
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
    color: '#2F6690',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadButtonText: {
    color: '#2F6690',
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
    color: '#D4A017',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: '#98A2B3',
    lineHeight: 20,
  },
});