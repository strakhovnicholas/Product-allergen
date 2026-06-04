package ru.productallergen.analytics.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import ru.productallergen.analytics.config.ReportKafkaProperties;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class ReportAiKafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ReportKafkaProperties kafkaProperties;

    public void sendRequest(ReportAiKafkaMessage message) {
        String key = message.getUserId() != null ? message.getUserId().toString() : message.getRequestId().toString();
        String topic = kafkaProperties.getRequestTopic();
        log.info("[ReportAI] Kafka produce request requestId={} topic={} key={}",
                message.getRequestId(), topic, key);
        kafkaTemplate.send(topic, key, message).whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("[ReportAI] Kafka produce request FAILED requestId={} topic={}",
                        message.getRequestId(), topic, ex);
            } else if (result != null && result.getRecordMetadata() != null) {
                log.info("[ReportAI] Kafka produce request OK requestId={} partition={} offset={}",
                        message.getRequestId(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }

    public void sendResult(ReportAiKafkaMessage message) {
        String key = message.getUserId() != null ? message.getUserId().toString() : message.getRequestId().toString();
        String topic = kafkaProperties.getResponseTopic();
        log.info("[ReportAI] Kafka produce result requestId={} topic={}", message.getRequestId(), topic);
        kafkaTemplate.send(topic, key, message).whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("[ReportAI] Kafka produce result FAILED requestId={}", message.getRequestId(), ex);
            }
        });
    }
}
