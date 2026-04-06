package ru.productallergen.authservice.config;

import io.netty.channel.ChannelOption;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${user.service.url}")
    private String userServiceUrl;

    private static final int RESPONSE_TIME_OUT_MILLIS = 5000;
    private static final int CONNECTION_TIME_OUT_MILLIS = 5000;

    @Bean
    public WebClient userServiceWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(RESPONSE_TIME_OUT_MILLIS))
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, CONNECTION_TIME_OUT_MILLIS);

        return WebClient.builder()
                .baseUrl(userServiceUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}