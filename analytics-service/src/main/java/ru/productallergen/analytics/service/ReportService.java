package ru.productallergen.analytics.service;

import lombok.RequiredArgsConstructor;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Service;
import ru.productallergen.analytics.client.UserServiceClient;
import ru.productallergen.analytics.dto.ai.AnalysisResultDto;
import ru.productallergen.analytics.dto.internal.CommonFeelingRequest;
import ru.productallergen.analytics.dto.internal.FoodComponentSymptomsResponse;
import ru.productallergen.analytics.dto.internal.MedicineDto;
import ru.productallergen.analytics.dto.internal.UserInfoDto;
import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {
    private static final DateTimeFormatter REQUEST_DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final JasperReport medicalReportTemplate;
    private final UserServiceClient userServiceClient;

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

    public ReportDataDto fillReport(UUID userId, LocalDateTime from, LocalDateTime to) {
        UserInfoDto userInfo = userServiceClient.getUserInfo();
        String fromIso = from.format(REQUEST_DATE_TIME_FORMATTER);
        String toIso = to.format(REQUEST_DATE_TIME_FORMATTER);

        List<MedicineDto> medicines = userServiceClient.getMedicines(fromIso, toIso).stream()
                .filter(medicine -> medicine.getIntakeDate() == null
                        || (!medicine.getIntakeDate().isBefore(from) && !medicine.getIntakeDate().isAfter(to)))
                .toList();

        List<CommonFeelingRequest> wellbeing = userServiceClient.getWellbeing(fromIso, toIso);

        List<FoodComponentSymptomsResponse> foodAnalysis = userServiceClient.analyzeFood(fromIso, toIso);

        AnalysisResultDto  analysisResult = transformToAnalysis(foodAnalysis);
        ReportDataDto report = new ReportDataDto();

        report.setUser(userInfo);
        report.setMedicine(medicines);
        report.setWellbeing(wellbeing);
        report.setFoodSymptoms(foodAnalysis);
        report.setAnalysis(analysisResult);

        return  report;
    }

    public AnalysisResultDto transformToAnalysis(List<FoodComponentSymptomsResponse> analyzeResponse) {
        List<String> products = analyzeResponse.stream()
                .map(FoodComponentSymptomsResponse::getFoodComponentName)
                .distinct()
                .toList();

        List<String> symptoms = analyzeResponse.stream()
                .filter(response -> response.getSymptomsName() != null)
                .filter(response -> !response.getSymptomsName().isEmpty())
                .flatMap(response -> response.getSymptomsName().stream())
                .distinct()
                .toList();

        return new AnalysisResultDto(
                symptoms,
                products,
                List.of(),
                List.of(),
                "aiRecommendations"
        );
    }
}