package ru.productallergen.analytics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import ru.productallergen.analytics.config.ReportKafkaProperties;
import ru.productallergen.analytics.dto.report.ReportDataDto;
import ru.productallergen.analytics.kafka.ReportAiKafkaMessage;
import ru.productallergen.analytics.kafka.ReportAiKafkaProducer;
import ru.productallergen.analytics.kafka.ReportAiRegistry;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
@Profile("!test")
@RequiredArgsConstructor
public class ReportAiOrchestrator implements ReportAiEnricher {

    private final ReportAiKafkaProducer kafkaProducer;
    private final ReportAiRegistry registry;
    private final ReportKafkaProperties kafkaProperties;
    private final GigaChatAnalysisService gigaChatAnalysisService;

    public ReportDataDto enrichViaKafka(UUID userId, LocalDateTime from, LocalDateTime to, ReportDataDto reportData) {
        UUID requestId = UUID.randomUUID();
        log.info("[ReportAI] enrichViaKafka start requestId={} userId={} topic={}",
                requestId, userId, kafkaProperties.getRequestTopic());
        registry.register(requestId);

        ReportAiKafkaMessage message = new ReportAiKafkaMessage(
                requestId,
                userId,
                from,
                to,
                reportData
        );
        kafkaProducer.sendRequest(message);

        try {
            ReportDataDto result = registry.await(requestId, kafkaProperties.getWaitTimeoutSeconds());
            log.info("[ReportAI] enrichViaKafka done via Kafka requestId={}", requestId);
            ReportService.logAnalysisResult("kafka path", result.getAnalysis());
            return result;
        } catch (TimeoutException e) {
            log.warn("[ReportAI] Kafka wait timeout ({}s) requestId={}, fallback to direct GigaChat",
                    kafkaProperties.getWaitTimeoutSeconds(), requestId);
            ReportDataDto fallback = gigaChatAnalysisService.enrichReport(reportData);
            ReportService.logAnalysisResult("timeout fallback", fallback.getAnalysis());
            return fallback;
        } catch (Exception e) {
            log.warn("[ReportAI] Kafka path failed requestId={}, fallback to direct GigaChat", requestId, e);
            ReportDataDto fallback = gigaChatAnalysisService.enrichReport(reportData);
            ReportService.logAnalysisResult("error fallback", fallback.getAnalysis());
            return fallback;
        }
    }
}
