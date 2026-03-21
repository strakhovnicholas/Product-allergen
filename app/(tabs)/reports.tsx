import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type ReportType = 'SUMMARY' | 'DETAILED' | 'FOOD_ANALYSIS' | 'SYMPTOM_ANALYSIS';
type ReportFormat = 'PDF' | 'DOCX';

const dashboardStats = {
  totalFoodEntries: 24,
  totalReactions: 7,
  avgWellbeing: 6.8,
  avgMood: 6.1,
  mostRiskyFood: 'Йогурт',
  safestFood: 'Рис',
};

const safeFoods = [
  {
    foodName: 'Рис',
    totalIntakes: 8,
    reactions: 0,
    safetyScore: 0.98,
  },
  {
    foodName: 'Гречка',
    totalIntakes: 6,
    reactions: 0,
    safetyScore: 0.95,
  },
  {
    foodName: 'Курица',
    totalIntakes: 5,
    reactions: 1,
    safetyScore: 0.8,
  },
];

const dangerFoods = [
  {
    foodName: 'Йогурт',
    totalIntakes: 5,
    reactions: 4,
    riskScore: 0.8,
  },
  {
    foodName: 'Орехи',
    totalIntakes: 3,
    reactions: 2,
    riskScore: 0.67,
  },
  {
    foodName: 'Клубника',
    totalIntakes: 4,
    reactions: 2,
    riskScore: 0.5,
  },
];

const generatedReports = [
  {
    id: '1',
    reportType: 'FOOD_ANALYSIS',
    format: 'PDF',
    status: 'READY',
    createdAt: '2026-03-20 18:40',
  },
  {
    id: '2',
    reportType: 'SUMMARY',
    format: 'DOCX',
    status: 'PROCESSING',
    createdAt: '2026-03-21 10:15',
  },
];

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

export default function ReportsScreen() {
  const [selectedType, setSelectedType] = useState<ReportType>('FOOD_ANALYSIS');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
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
                {dashboardStats.avgWellbeing}
              </Text>
              <Text style={styles.statLabel}>Среднее самочувствие</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FCF8E8' }]}>
              <Text style={[styles.statValue, { color: '#D4A017' }]}>
                {dashboardStats.avgMood}
              </Text>
              <Text style={styles.statLabel}>Среднее настроение</Text>
            </View>
          </View>

          <View style={styles.highlightList}>
            <View style={styles.highlightRow}>
              <Ionicons name="warning-outline" size={20} color="#E63946" />
              <Text style={styles.highlightText}>
                Самый рискованный продукт: <Text style={styles.highlightStrong}>{dashboardStats.mostRiskyFood}</Text>
              </Text>
            </View>

            <View style={styles.highlightRow}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#2DCB70" />
              <Text style={styles.highlightText}>
                Самый безопасный продукт: <Text style={styles.highlightStrong}>{dashboardStats.safestFood}</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Безопасные продукты</Text>

          <View style={styles.list}>
            {safeFoods.map((item, index) => (
              <View key={index} style={styles.listCard}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{item.foodName}</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: '#EAF8F0' }]}>
                    <Text style={[styles.scoreText, { color: '#2DCB70' }]}>
                      {(item.safetyScore * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.metaText}>Употреблений: {item.totalIntakes}</Text>
                <Text style={styles.metaText}>Реакций: {item.reactions}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Опасные продукты</Text>

          <View style={styles.list}>
            {dangerFoods.map((item, index) => (
              <View key={index} style={styles.listCard}>
                <View style={styles.listHeader}>
                  <Text style={styles.listTitle}>{item.foodName}</Text>
                  <View style={[styles.scoreBadge, { backgroundColor: '#FCEBED' }]}>
                    <Text style={[styles.scoreText, { color: '#E63946' }]}>
                      {(item.riskScore * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.metaText}>Употреблений: {item.totalIntakes}</Text>
                <Text style={styles.metaText}>Реакций: {item.reactions}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Сгенерировать отчёт</Text>

          <Text style={styles.smallLabel}>Тип отчёта</Text>
          <View style={styles.chipsRow}>
            {(['SUMMARY', 'DETAILED', 'FOOD_ANALYSIS', 'SYMPTOM_ANALYSIS'] as ReportType[]).map((type) => {
              const isActive = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, isActive && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedType(type)}>
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
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
                  style={[styles.formatButton, isActive && styles.formatButtonActive]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedFormat(format)}>
                  <Text style={[styles.formatButtonText, isActive && styles.formatButtonTextActive]}>
                    {format}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.dateBox}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Начало периода</Text>
              <Text style={styles.dateValue}>2026-03-01</Text>
            </View>

            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Конец периода</Text>
              <Text style={styles.dateValue}>2026-03-21</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.generateButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="file-chart-outline" size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Сгенерировать отчёт</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Последние отчёты</Text>

          <View style={styles.list}>
            {generatedReports.map((item) => (
              <View key={item.id} style={styles.reportCard}>
                <View style={styles.reportTop}>
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{reportTypeLabel(item.reportType as ReportType)}</Text>
                    <Text style={styles.reportDate}>{item.createdAt}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor(item.status)}18` }]}>
                    <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                      {statusLabel(item.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportBottom}>
                  <Text style={styles.reportFormat}>{item.format}</Text>

                  {item.status === 'READY' ? (
                    <TouchableOpacity style={styles.downloadButton} activeOpacity={0.85}>
                      <Ionicons name="download-outline" size={18} color="#2F6690" />
                      <Text style={styles.downloadButtonText}>Скачать</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.processingBox}>
                      <Text style={styles.processingText}>Ожидайте завершения</Text>
                    </View>
                  )}
                </View>
              </View>
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
});