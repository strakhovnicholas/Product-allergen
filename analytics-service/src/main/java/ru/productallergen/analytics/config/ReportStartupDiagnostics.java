package ru.productallergen.analytics.config;

import chat.giga.client.GigaChatClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@Profile("!test")
@RequiredArgsConstructor
public class ReportStartupDiagnostics implements ApplicationRunner {

    private final Environment environment;
    private final ReportKafkaProperties kafkaProperties;
    private final GigaChatProperties gigaChatProperties;
    private final ObjectProvider<GigaChatClient> gigaChatClient;

    @Override
    public void run(ApplicationArguments args) {
        String bootstrap = environment.getProperty("spring.kafka.bootstrap-servers", "?");
        boolean gigachatKeySet = StringUtils.hasText(gigaChatProperties.getAuthKey());
        boolean gigachatClientReady = gigaChatClient.getIfAvailable() != null;

        log.info("[ReportAI] Startup: kafka.bootstrap-servers={}", bootstrap);
        log.info("[ReportAI] Startup: topics request={}, response={}, waitTimeoutSec={}",
                kafkaProperties.getRequestTopic(),
                kafkaProperties.getResponseTopic(),
                kafkaProperties.getWaitTimeoutSeconds());
        log.info("[ReportAI] Startup: GIGACHAT_AUTH_KEY set={}, GigaChatClient bean={}, model={}",
                gigachatKeySet,
                gigachatClientReady,
                gigaChatProperties.getModel());
        if (!gigachatKeySet) {
            log.warn("[ReportAI] Startup: AI recommendations will be baseline-only until GIGACHAT_AUTH_KEY is configured");
        }
    }
}
