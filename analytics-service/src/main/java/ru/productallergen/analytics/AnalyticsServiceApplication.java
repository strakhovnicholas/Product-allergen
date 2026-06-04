package ru.productallergen.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.kafka.annotation.EnableKafka;
import ru.productallergen.analytics.config.GigaChatProperties;
import ru.productallergen.analytics.config.ReportKafkaProperties;

@SpringBootApplication
@EnableFeignClients
@EnableKafka
@EnableConfigurationProperties({ReportKafkaProperties.class, GigaChatProperties.class})
public class AnalyticsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}
