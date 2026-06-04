package ru.productallergen.analytics.config;

import chat.giga.client.GigaChatClient;
import chat.giga.client.auth.AuthClient;
import chat.giga.client.auth.AuthClientBuilder;
import chat.giga.model.Scope;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
@EnableConfigurationProperties(GigaChatProperties.class)
public class GigaChatConfig {

    @Bean
    public GigaChatClient gigaChatClient(GigaChatProperties properties) {
        if (!StringUtils.hasText(properties.getAuthKey())) {
            log.warn("[ReportAI] GigaChatClient bean skipped: GIGACHAT_AUTH_KEY is empty");
            return null;
        }
        log.info("[ReportAI] GigaChatClient bean created, model={}", properties.getModel());
        return GigaChatClient.builder()
                .verifySslCerts(properties.isVerifySslCerts())
                .authClient(AuthClient.builder()
                        .withOAuth(AuthClientBuilder.OAuthBuilder.builder()
                                .scope(Scope.GIGACHAT_API_PERS)
                                .authKey(properties.getAuthKey())
                                .build())
                        .build())
                .build();
    }
}
