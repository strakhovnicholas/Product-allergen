package ru.productallergen.analytics.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.productallergen.analytics.dto.report.ReportDataDto;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportAiKafkaMessage {
    private UUID requestId;
    private UUID userId;
    private LocalDateTime periodFrom;
    private LocalDateTime periodTo;
    private ReportDataDto reportData;
}
