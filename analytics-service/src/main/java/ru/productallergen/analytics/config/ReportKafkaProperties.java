package ru.productallergen.analytics.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "report.kafka")
public class ReportKafkaProperties {
    private String requestTopic = "report-ai-requests";
    private String responseTopic = "report-ai-results";
    private long waitTimeoutSeconds = 90;
}
