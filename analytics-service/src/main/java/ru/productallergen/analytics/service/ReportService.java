package ru.productallergen.analytics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import ru.productallergen.analytics.dto.ai.AnalysisResultDto;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Service;
import ru.productallergen.analytics.client.UserServiceClient;
import ru.productallergen.analytics.dto.internal.CommonFeelingRequest;
import ru.productallergen.analytics.dto.internal.FoodComponentSymptomsResponse;
import ru.productallergen.analytics.dto.internal.MedicineDto;
import ru.productallergen.analytics.dto.internal.UserInfoDto;
import ru.productallergen.analytics.dto.report.ReportDataDto;
import ru.productallergen.analytics.entity.ReportSnapshot;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {
    private static final DateTimeFormatter REQUEST_DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final JasperReport medicalReportTemplate;
    private final UserServiceClient userServiceClient;
    private final ReportAiEnricher reportAiEnricher;
    private final ReportSnapshotService reportSnapshotService;

    public byte[] generateMedicalReport(ReportDataDto data) throws JRException {
        System.setProperty("java.awt.headless", "true");

        try {
            JRBeanCollectionDataSource dataSource =
                    new JRBeanCollectionDataSource(List.of(data));

            return JasperExportManager.exportReportToPdf(
                    JasperFillManager.fillReport(medicalReportTemplate, new java.util.HashMap<>(), dataSource)
            );

        } catch (Exception e) {
            throw new JRException("Generating PDF error: " + e.getMessage(), e);
        }
    }

    public ReportGenerationResult buildAndPersistReport(UUID userId, LocalDateTime from, LocalDateTime to) {
        log.info("[ReportAI] buildAndPersistReport start userId={} period={}..{}", userId, from, to);
        ReportDataDto baseReport = collectReportData(from, to);
        logCollectedData(baseReport);
        ReportDataDto enriched = reportAiEnricher.enrichViaKafka(userId, from, to, baseReport);
        logAnalysisResult("after enrich", enriched.getAnalysis());
        ReportSnapshot snapshot = reportSnapshotService.save(userId, from, to, enriched);
        log.info("[ReportAI] buildAndPersistReport saved snapshotId={}", snapshot.getId());
        return new ReportGenerationResult(enriched, snapshot.getId());
    }

    private void logCollectedData(ReportDataDto report) {
        int medicines = report.getMedicine() != null ? report.getMedicine().size() : 0;
        int wellbeing = report.getWellbeing() != null ? report.getWellbeing().size() : 0;
        int foodRows = report.getFoodSymptoms() != null ? report.getFoodSymptoms().size() : 0;
        log.info("[ReportAI] collected data: medicines={}, wellbeing={}, foodSymptoms={}",
                medicines, wellbeing, foodRows);
    }

    public static void logAnalysisResult(String stage, AnalysisResultDto analysis) {
        if (analysis == null) {
            log.warn("[ReportAI] {}: analysis=null", stage);
            return;
        }
        int recLen = analysis.getDoctorRecommendations() != null
                ? analysis.getDoctorRecommendations().length()
                : 0;
        log.info("[ReportAI] {}: symptoms={}, products={}, proteins={}, trace={}, recommendationsChars={}",
                stage,
                sizeOf(analysis.getSymptoms()),
                sizeOf(analysis.getProducts()),
                sizeOf(analysis.getDangerousProteins()),
                sizeOf(analysis.getTraceElements()),
                recLen);
        if (!StringUtils.hasText(analysis.getDoctorRecommendations())) {
            log.warn("[ReportAI] {}: doctorRecommendations empty (GigaChat off or parse failed?)", stage);
        }
    }

    private static int sizeOf(List<?> list) {
        return list != null ? list.size() : 0;
    }

    public ReportDataDto loadSnapshotData(Long snapshotId, UUID userId) {
        return reportSnapshotService.getForUser(snapshotId, userId).getReportData();
    }

    private ReportDataDto collectReportData(LocalDateTime from, LocalDateTime to) {
        UserInfoDto userInfo = userServiceClient.getUserInfo();
        String fromIso = from.format(REQUEST_DATE_TIME_FORMATTER);
        String toIso = to.format(REQUEST_DATE_TIME_FORMATTER);

        List<MedicineDto> medicines = userServiceClient.getMedicines(fromIso, toIso).stream()
                .filter(medicine -> medicine.getIntakeDate() == null
                        || (!medicine.getIntakeDate().isBefore(from) && !medicine.getIntakeDate().isAfter(to)))
                .toList();

        List<CommonFeelingRequest> wellbeing = userServiceClient.getWellbeing(fromIso, toIso);
        List<FoodComponentSymptomsResponse> foodAnalysis = userServiceClient.analyzeFood(fromIso, toIso);

        ReportDataDto report = new ReportDataDto();
        report.setUser(userInfo);
        report.setMedicine(medicines);
        report.setWellbeing(wellbeing);
        report.setFoodSymptoms(foodAnalysis);
        report.setAnalysis(null);
        return report;
    }

    public record ReportGenerationResult(ReportDataDto reportData, Long snapshotId) {
    }
}
