import { ScreenSafeArea } from '../../components/ScreenSafeArea';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { useReportPeriod } from '../../src/context/ReportPeriodContext';
import { openReportPdf, type SavedReport } from '../../src/services/reportFileSave';
import { isInDayRange } from '../../src/utils/datetime';
import {
  analyzeFoodAndSymptomsApi,
  CommonFeeling,
  Food,
  FoodComponentSymptomsResponse,
  getCommonFeelingsByPeriodApi,
  getFoodByPeriodApi,
  getSymptomsByDateRangeApi,
  Symptom,
} from '../../src/api/diaryApi';
import {
  GeneratedReport,
  generateReportApi,
  getGeneratedReportsApi,
  ReportType,
} from '../../src/api/reportApi';
import { COLORS } from '../../src/styles/palette';

const SECTION_COLORS = {
  primary: COLORS.primary,
  danger: COLORS.danger,
  success: COLORS.success,
  warning: COLORS.warning,
  violet: '#7C3AED',
} as const;

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
      return '#22C55E';
    case 'PROCESSING':
      return '#D97706';
    case 'FAILED':
      return '#E11D48';
    default:
      return '#98A2B3';
  }
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

function toStartOfDayIso(value: string) {
  return `${value}T00:00:00`;
}

function toEndOfDayIso(value: string) {
  return `${value}T23:59:59`;
}

function reportTypeIcon(type: ReportType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'SUMMARY':
      return 'document-text-outline';
    case 'DETAILED':
      return 'list-outline';
    case 'FOOD_ANALYSIS':
      return 'restaurant-outline';
    case 'SYMPTOM_ANALYSIS':
      return 'pulse-outline';
    default:
      return 'document-outline';
  }
}

function ReportSection({
  title,
  subtitle,
  icon,
  accentColor,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: `${accentColor}18` }]}>
          <Ionicons name={icon} size={20} color={accentColor} />
        </View>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.sectionPeriod}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );
}

function MetricCard({
  icon,
  value,
  label,
  accentColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  accentColor: string;
}) {
  return (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: `${accentColor}0A`, borderColor: `${accentColor}22` },
      ]}
    >
      <View style={[styles.metricCardIcon, { backgroundColor: `${accentColor}16` }]}>
        <Ionicons name={icon} size={16} color={accentColor} />
      </View>
      <Text style={[styles.metricCardValue, { color: accentColor }]}>{value}</Text>
      <Text style={styles.metricCardLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function InsightInline({
  label,
  value,
  icon,
  accentColor,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
}) {
  return (
    <View
      style={[
        styles.insightInline,
        { backgroundColor: `${accentColor}0A`, borderColor: `${accentColor}22` },
      ]}
    >
      <Ionicons name={icon} size={16} color={accentColor} />
      <View style={styles.insightInlineText}>
        <Text style={styles.insightInlineLabel}>{label}</Text>
        <Text style={styles.insightInlineValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function CompactListRow({
  icon,
  title,
  meta,
  badge,
  accentColor,
  trailing,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  meta?: string;
  badge?: string;
  accentColor: string;
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const inner = (
    <View
      style={[
        styles.compactRow,
        { backgroundColor: `${accentColor}08`, borderColor: `${accentColor}20` },
      ]}
    >
      <View style={[styles.compactStripe, { backgroundColor: accentColor }]} />
      <View style={[styles.compactIcon, { backgroundColor: `${accentColor}14` }]}>
        <Ionicons name={icon} size={16} color={accentColor} />
      </View>
      <View style={styles.compactText}>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!meta && (
          <Text style={styles.compactMeta} numberOfLines={1}>
            {meta}
          </Text>
        )}
      </View>
      {!!badge && (
        <View style={[styles.compactBadge, { backgroundColor: `${accentColor}14` }]}>
          <Text style={[styles.compactBadgeText, { color: accentColor }]}>{badge}</Text>
        </View>
      )}
      {!!trailing && <View style={styles.compactTrailing}>{trailing}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.88} onPress={onPress} disabled={disabled}>
        {inner}
      </TouchableOpacity>
    );
  }

  return inner;
}

function EmptyHint({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyCardText}>{text}</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const {
    hydrated,
    draftFrom,
    draftTo,
    activeFrom,
    activeTo,
    activePeriodLabel,
    setDraftFrom,
    setDraftTo,
    setQuickPeriodDays,
    validatePeriod,
    applyPeriod: applyPeriodToContext,
  } = useReportPeriod();

  const [foods, setFoods] = useState<Food[]>([]);
  const [feelings, setFeelings] = useState<CommonFeeling[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [analyzerData, setAnalyzerData] = useState<FoodComponentSymptomsResponse[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applyingPeriod, setApplyingPeriod] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [readyReport, setReadyReport] = useState<SavedReport | null>(null);
  const [openingReport, setOpeningReport] = useState(false);

  const periodError = useMemo(
    () => validatePeriod(draftFrom, draftTo),
    [draftFrom, draftTo, validatePeriod],
  );

  const loadAnalyzerForPeriod = useCallback(async (fromDay: string, toDay: string) => {
    const from = toStartOfDayIso(fromDay);
    const to = toEndOfDayIso(toDay);
    const analyzer = await analyzeFoodAndSymptomsApi(from, to).catch(() => []);
    setAnalyzerData(analyzer ?? []);
  }, []);

  const loadReportsData = useCallback(
    async (fromDay: string, toDay: string, isRefresh = false) => {
      const error = validatePeriod(fromDay, toDay);
      if (error) {
        setFoods([]);
        setFeelings([]);
        setSymptoms([]);
        return;
      }

      const from = toStartOfDayIso(fromDay);
      const to = toEndOfDayIso(toDay);

      try {
        if (isRefresh) setRefreshing(true);
        else setInitialLoading(true);

        const [foodsResult, feelingsResult, symptomsResult, reportsResult] =
          await Promise.allSettled([
            getFoodByPeriodApi(from, to),
            getCommonFeelingsByPeriodApi(from, to),
            getSymptomsByDateRangeApi(from, to),
            getGeneratedReportsApi(),
          ]);

        setFoods(foodsResult.status === 'fulfilled' ? foodsResult.value ?? [] : []);
        setFeelings(feelingsResult.status === 'fulfilled' ? feelingsResult.value ?? [] : []);
        setSymptoms(symptomsResult.status === 'fulfilled' ? symptomsResult.value ?? [] : []);
        setGeneratedReports(
          reportsResult.status === 'fulfilled' ? reportsResult.value ?? [] : [],
        );
      } catch (error) {
        Alert.alert(
          'Ошибка',
          error instanceof Error ? error.message : 'Не удалось загрузить данные отчётов',
        );
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [validatePeriod],
  );

  const reloadAllForPeriod = useCallback(
    async (fromDay: string, toDay: string, isRefresh = false) => {
      await Promise.all([
        loadReportsData(fromDay, toDay, isRefresh),
        loadAnalyzerForPeriod(fromDay, toDay),
      ]);
    },
    [loadAnalyzerForPeriod, loadReportsData],
  );

  useEffect(() => {
    if (!hydrated) return;
    void reloadAllForPeriod(activeFrom, activeTo, false);
  }, [hydrated, activeFrom, activeTo, reloadAllForPeriod]);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated) return;
      void reloadAllForPeriod(activeFrom, activeTo, true);
    }, [hydrated, activeFrom, activeTo, reloadAllForPeriod]),
  );

  const applyPeriod = useCallback(async () => {
    if (periodError) {
      Alert.alert('Ошибка периода', periodError);
      return;
    }
    try {
      setApplyingPeriod(true);
      const period = await applyPeriodToContext();
      await reloadAllForPeriod(period.from, period.to, true);
    } catch (error) {
      Alert.alert(
        'Ошибка периода',
        error instanceof Error ? error.message : 'Некорректный период',
      );
    } finally {
      setApplyingPeriod(false);
    }
  }, [applyPeriodToContext, periodError, reloadAllForPeriod]);

  const handleGenerateReport = useCallback(async () => {
    const periodErrorActive = validatePeriod(activeFrom, activeTo);
    if (periodErrorActive) {
      Alert.alert('Ошибка периода', periodErrorActive);
      return;
    }

    try {
      setGenerating(true);
      const saved = await generateReportApi(activeFrom, activeTo);
      setReadyReport(saved);
      const reports = await getGeneratedReportsApi().catch(() => []);
      setGeneratedReports(reports ?? []);
    } catch (error) {
      Alert.alert(
        'Ошибка',
        error instanceof Error ? error.message : 'Не удалось сгенерировать отчёт',
      );
    } finally {
      setGenerating(false);
    }
  }, [activeFrom, activeTo, validatePeriod]);

  const handleOpenReadyReport = useCallback(async () => {
    if (!readyReport?.fileUri) return;
    try {
      setOpeningReport(true);
      await openReportPdf(readyReport.fileUri, readyReport.mimeType);
    } catch (error) {
      Alert.alert(
        'Не удалось открыть',
        error instanceof Error ? error.message : 'Установите приложение для просмотра PDF',
      );
    } finally {
      setOpeningReport(false);
    }
  }, [readyReport]);

  const handleDownload = async (report: GeneratedReport) => {
    if (!report.downloadUrl) {
      Alert.alert('Информация', 'Ссылка на скачивание пока недоступна');
      return;
    }

    try {
      await Linking.openURL(report.downloadUrl);
    } catch {
      Alert.alert('Ошибка', 'Не удалось открыть ссылку на скачивание');
    }
  };

  const dashboardStats = useMemo(() => {
    const periodFoods = foods.filter((item) =>
      isInDayRange(item.intakeTime, activeFrom, activeTo),
    );
    const periodFeelings = feelings.filter((item) =>
      isInDayRange(item.dateTime, activeFrom, activeTo),
    );

    const totalFoodEntries = periodFoods.length;
    const totalReactions = periodFoods.filter((item) => item.reactionOccurred).length;
    const avgWellbeing = average(
      periodFeelings
        .map((item) => item.wellbeingScore)
        .filter((value) => typeof value === 'number'),
    );

    const groupedFood = new Map<
      string,
      { foodName: string; totalIntakes: number; reactions: number }
    >();

    periodFoods.forEach((item) => {
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
      wellbeingSamples: periodFeelings.length,
      mostRiskyFood: riskySorted[0]?.foodName ?? 'Нет данных',
      safestFood: safeSorted[0]?.foodName ?? 'Нет данных',
      safeFoods: safeSorted.slice(0, 5),
      dangerFoods: riskySorted.slice(0, 5),
    };
  }, [foods, feelings, activeFrom, activeTo]);

  if (!hydrated) {
    return (
      <ScreenSafeArea style={styles.safeArea}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      </ScreenSafeArea>
    );
  }

  return (
    <ScreenSafeArea style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void reloadAllForPeriod(activeFrom, activeTo, true);
            }}
          />
        }
      >
        {initialLoading && (
          <View style={styles.inlineLoader}>
            <ActivityIndicator size="small" color="#1D4ED8" />
            <Text style={styles.inlineLoaderText}>Загружаем данные с сервера…</Text>
          </View>
        )}

        {readyReport ? (
          <View style={styles.readyReportWrap}>
            <CompactListRow
              icon="document-outline"
              title="Отчёт готов — нажмите, чтобы открыть"
              meta={readyReport.fileName}
              badge="PDF"
              accentColor={SECTION_COLORS.primary}
              onPress={() => {
                void handleOpenReadyReport();
              }}
              disabled={openingReport}
              trailing={
                openingReport ? (
                  <ActivityIndicator color={SECTION_COLORS.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={SECTION_COLORS.primary} />
                )
              }
            />
          </View>
        ) : null}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="bar-chart-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroTitle}>Отчёты и аналитика</Text>
              <Text style={styles.heroSubtitle}>
                Сводка и PDF-отчёты с сервера за выбранный период.
              </Text>
            </View>
          </View>
          <View style={styles.heroPeriodCard}>
            <Text style={styles.heroPeriodLabel}>Период отчёта</Text>
            <Text style={styles.heroPeriodValue}>Активно: {activePeriodLabel}</Text>
            <View style={styles.periodQuickRow}>
              {[
                { label: '7 дн', days: 7 },
                { label: '30 дн', days: 30 },
                { label: '90 дн', days: 90 },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  style={styles.periodQuickChip}
                  activeOpacity={0.85}
                  onPress={() => {
                    void setQuickPeriodDays(preset.days);
                  }}
                >
                  <Text style={styles.periodQuickChipText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.periodInputRow}>
              <View style={styles.periodInputBox}>
                <Text style={styles.periodInputLabel}>С</Text>
                <TextInput
                  style={styles.periodInput}
                  value={draftFrom}
                  onChangeText={(value) => setDraftFrom(value.trim())}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#BFD0FF"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.periodInputBox}>
                <Text style={styles.periodInputLabel}>По</Text>
                <TextInput
                  style={styles.periodInput}
                  value={draftTo}
                  onChangeText={(value) => setDraftTo(value.trim())}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#BFD0FF"
                  autoCapitalize="none"
                />
              </View>
            </View>
            {periodError ? <Text style={styles.periodErrorText}>{periodError}</Text> : null}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={[styles.heroActionButton, applyingPeriod && styles.buttonDisabled]}
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
                  generating && styles.buttonDisabled,
                ]}
                disabled={generating}
                onPress={() => {
                  void handleGenerateReport();
                }}
              >
                <Text style={styles.heroActionButtonPrimaryText}>
                  {generating ? 'Генерируем...' : 'Сгенерировать PDF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ReportSection
          title="Сводка за период"
          subtitle={activePeriodLabel}
          icon="grid-outline"
          accentColor={SECTION_COLORS.primary}
        >
          <View style={[styles.metricsRow, isCompact && styles.metricsRowCompact]}>
            <MetricCard
              icon="restaurant-outline"
              value={String(dashboardStats.totalFoodEntries)}
              label="Еда"
              accentColor={SECTION_COLORS.primary}
            />
            <MetricCard
              icon="warning-outline"
              value={String(dashboardStats.totalReactions)}
              label="Реакции"
              accentColor={SECTION_COLORS.danger}
            />
            <MetricCard
              icon="heart-outline"
              value={
                dashboardStats.wellbeingSamples
                  ? dashboardStats.avgWellbeing.toFixed(1)
                  : '—'
              }
              label="Самочувствие"
              accentColor={SECTION_COLORS.success}
            />
          </View>
          <View style={styles.insightRow}>
            <InsightInline
              label="Риск"
              value={dashboardStats.mostRiskyFood}
              icon="warning-outline"
              accentColor={SECTION_COLORS.danger}
            />
            <InsightInline
              label="Безопасно"
              value={dashboardStats.safestFood}
              icon="shield-checkmark-outline"
              accentColor={SECTION_COLORS.success}
            />
          </View>
        </ReportSection>

        <ReportSection
          title="Продукты"
          subtitle="Безопасные и рискованные"
          icon="nutrition-outline"
          accentColor={SECTION_COLORS.primary}
        >
          {dashboardStats.safeFoods.length === 0 && dashboardStats.dangerFoods.length === 0 ? (
            <EmptyHint text="Пока недостаточно данных по продуктам." />
          ) : (
            <View style={styles.list}>
              {dashboardStats.dangerFoods.length > 0 && (
                <>
                  <Text style={styles.listGroupLabel}>Повышенный риск</Text>
                  {dashboardStats.dangerFoods.map((item) => (
                    <CompactListRow
                      key={`danger-${item.foodName}`}
                      icon="flame-outline"
                      title={item.foodName}
                      meta={`${item.reactions} реакц. · ${item.totalIntakes} приёмов`}
                      badge={toSafePercent(item.riskScore)}
                      accentColor={SECTION_COLORS.danger}
                    />
                  ))}
                </>
              )}
              {dashboardStats.safeFoods.length > 0 && (
                <>
                  <Text style={styles.listGroupLabel}>Без реакций</Text>
                  {dashboardStats.safeFoods.map((item) => (
                    <CompactListRow
                      key={`safe-${item.foodName}`}
                      icon="restaurant-outline"
                      title={item.foodName}
                      meta={`${item.totalIntakes} приёмов · 0 реакций`}
                      badge={toSafePercent(item.safetyScore)}
                      accentColor={SECTION_COLORS.success}
                    />
                  ))}
                </>
              )}
            </View>
          )}
        </ReportSection>

        <ReportSection
          title="Компоненты и симптомы"
          subtitle={activePeriodLabel}
          icon="analytics-outline"
          accentColor={SECTION_COLORS.violet}
        >
          <View style={styles.list}>
            {analyzerData.length === 0 ? (
              <EmptyHint text="Недостаточно данных для анализа за выбранный период." />
            ) : (
              analyzerData.map((item) => (
                <CompactListRow
                  key={item.foodComponentName}
                  icon="flask-outline"
                  title={item.foodComponentName}
                  meta={
                    item.symptomsName.length > 0
                      ? item.symptomsName.join(', ')
                      : 'Связанные симптомы не обнаружены'
                  }
                  badge={
                    item.symptomsName.length > 0
                      ? `${item.symptomsName.length}`
                      : undefined
                  }
                  accentColor={SECTION_COLORS.violet}
                />
              ))
            )}
          </View>
        </ReportSection>

        <ReportSection
          title="История отчётов"
          subtitle={activePeriodLabel}
          icon="folder-open-outline"
          accentColor={SECTION_COLORS.primary}
        >
          <View style={styles.list}>
            {generatedReports.length === 0 ? (
              <EmptyHint text="Отчётов пока нет. Сгенерируйте PDF за период." />
            ) : (
              generatedReports.map((item) => {
                const statusTint = statusColor(item.status);
                return (
                  <CompactListRow
                    key={item.id}
                    icon={reportTypeIcon(item.reportType)}
                    title={reportTypeLabel(item.reportType)}
                    meta={`${formatDate(item.createdAt)} · ${item.format}`}
                    badge={statusLabel(item.status)}
                    accentColor={statusTint}
                    trailing={
                      item.status === 'READY' ? (
                        <TouchableOpacity
                          style={[
                            styles.downloadAction,
                            { backgroundColor: `${statusTint}14` },
                          ]}
                          activeOpacity={0.85}
                          onPress={() => {
                            void handleDownload(item);
                          }}
                        >
                          <Ionicons name="download-outline" size={16} color={statusTint} />
                        </TouchableOpacity>
                      ) : (
                        <ActivityIndicator size="small" color={statusTint} />
                      )
                    }
                  />
                );
              })
            )}
          </View>
        </ReportSection>
      </ScrollView>
    </ScreenSafeArea>
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
    paddingBottom: 140,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inlineLoaderText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  readyReportWrap: {
    marginBottom: 12,
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
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  periodQuickRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  periodQuickChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFFFFF45',
    backgroundColor: '#FFFFFF1A',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  periodQuickChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  buttonDisabled: {
    opacity: 0.7,
  },
  sectionWrap: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  sectionPeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metricsRowCompact: {
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 96,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  metricCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricCardValue: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 24,
  },
  metricCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  insightRow: {
    gap: 8,
  },
  insightInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  insightInlineText: {
    flex: 1,
    minWidth: 0,
  },
  insightInlineLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  insightInlineValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 1,
  },
  list: {
    gap: 6,
  },
  listGroupLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 4,
    marginBottom: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 52,
    paddingRight: 8,
  },
  compactStripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    marginLeft: 8,
    marginRight: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactText: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  compactMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  compactBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  compactBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  compactTrailing: {
    marginLeft: 4,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyCardText: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    textAlign: 'center',
  },
  downloadAction: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
