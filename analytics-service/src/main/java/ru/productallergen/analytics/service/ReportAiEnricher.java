package ru.productallergen.analytics.service;

import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.time.LocalDateTime;
import java.util.UUID;

public interface ReportAiEnricher {

    ReportDataDto enrichViaKafka(UUID userId, LocalDateTime from, LocalDateTime to, ReportDataDto reportData);
}
