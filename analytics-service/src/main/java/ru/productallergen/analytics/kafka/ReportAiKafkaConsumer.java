package ru.productallergen.analytics.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import ru.productallergen.analytics.dto.report.ReportDataDto;
import ru.productallergen.analytics.service.GigaChatAnalysisService;
import ru.productallergen.analytics.service.ReportService;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class ReportAiKafkaConsumer {

    private final GigaChatAnalysisService gigaChatAnalysisService;
    private final ReportAiRegistry registry;
    private final ReportAiKafkaProducer producer;

    @KafkaListener(
            topics = "${report.kafka.request-topic}",
            groupId = "${spring.kafka.consumer.group-id:analytics-service}"
    )
    public void onReportAiRequest(ReportAiKafkaMessage message) {
        log.info("[ReportAI] Kafka consume request requestId={} userId={} period={}..{}",
                message.getRequestId(),
                message.getUserId(),
                message.getPeriodFrom(),
                message.getPeriodTo());
        try {
            ReportDataDto enriched = gigaChatAnalysisService.enrichReport(message.getReportData());
            message.setReportData(enriched);
            ReportService.logAnalysisResult("consumer enriched", enriched.getAnalysis());

            producer.sendResult(message);
            registry.complete(message.getRequestId(), enriched);
            log.info("[ReportAI] Kafka consume request done requestId={}", message.getRequestId());
        } catch (Exception e) {
            log.error("[ReportAI] Kafka consume request FAILED requestId={}", message.getRequestId(), e);
            registry.fail(message.getRequestId(), e);
        }
    }
}
