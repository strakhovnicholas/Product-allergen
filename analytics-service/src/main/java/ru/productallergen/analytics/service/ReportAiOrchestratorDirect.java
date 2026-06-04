package ru.productallergen.analytics.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Profile("test")
public class ReportAiOrchestratorDirect implements ReportAiEnricher {

    private final GigaChatAnalysisService gigaChatAnalysisService;

    public ReportAiOrchestratorDirect(GigaChatAnalysisService gigaChatAnalysisService) {
        this.gigaChatAnalysisService = gigaChatAnalysisService;
    }

    public ReportDataDto enrichViaKafka(UUID userId, LocalDateTime from, LocalDateTime to, ReportDataDto reportData) {
        return gigaChatAnalysisService.enrichReport(reportData);
    }
}
