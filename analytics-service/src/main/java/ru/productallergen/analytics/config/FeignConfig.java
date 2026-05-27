package ru.productallergen.analytics.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.http.HttpHeaders;

@Configuration
public class FeignConfig {

    @Value("${internal.api.secret:${app.internal.api.secret:my-default-secret}}")
    private String internalSecret;

    @Value("${app.security.internal-header:X-Internal-Gateway-Token}")
    private String internalHeaderName;

    @Value("${app.security.user-id-header:X-User-Id}")
    private String userIdHeaderName;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            requestTemplate.header(internalHeaderName, internalSecret);

            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();

                String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
                if (authHeader != null) {
                    requestTemplate.header(HttpHeaders.AUTHORIZATION, authHeader);
                }

                String userId = request.getHeader(userIdHeaderName);
                if (userId != null) {
                    requestTemplate.header(userIdHeaderName, userId);
                }
            }
        };
    }
}