package ru.productallergen.gateway.filter;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import ru.productallergen.gateway.utils.JwtUtils;

@Component
@Slf4j
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {
    public static final String X_USER_ID = "X-User-Id";
    public static final String X_INTERNAL_TOKEN = "X-Internal-Gateway-Token";

    private static final String BEARER_PREFIX = "Bearer ";
    private static final int BEARER_OFFSET = 7;
    private static final String EXPECTED_TOKEN_TYPE = "access";

    private static final String TEST_USER_ID = "test-id";

    private final JwtUtils jwtUtils;

    @Value("${internal.api.secret}")
    private String internalSecret;

    public AuthenticationFilter(JwtUtils jwtUtils) {
        super(Config.class);
        this.jwtUtils = jwtUtils;
    }

    @Getter
    @Setter
    public static class Config {
        private boolean skipAuth = false;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            log.debug("Processing authentication for path: {}", path);

            if (config.skipAuth) {
                log.info("Skipping authentication for request to: {} (Test Mode)", path);
                ServerHttpRequest mutated = request.mutate()
                        .header(X_USER_ID, TEST_USER_ID)
                        .header(X_INTERNAL_TOKEN, internalSecret)
                        .build();

                return chain.filter(exchange.mutate().request(mutated).build());
            }

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.warn("Authentication failed for path {}: Missing Authorization header", path);
                return Mono.error(new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authorization header is missing"));
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                log.warn("Authentication failed for path {}: Invalid header format", path);
                return Mono.error(new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid Authorization header format"));
            }

            String token = authHeader.substring(BEARER_OFFSET);

            try {
                if (!jwtUtils.validateToken(token, EXPECTED_TOKEN_TYPE)) {
                    log.warn("Authentication failed for path {}: Invalid or expired access token", path);
                    return Mono.error(new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED, "Invalid or expired access token"));
                }
            } catch (Exception e) {
                log.error("Error during token validation for path {}: {}", path, e.getMessage());
                return Mono.error(new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Token validation error"));
            }

            String userId = jwtUtils.extractId(token);
            log.debug("User authenticated. Path: {}, UserId: {}", path, userId);

            ServerHttpRequest modifiedRequest = request.mutate()
                    .header(X_USER_ID, userId)
                    .header(X_INTERNAL_TOKEN, internalSecret)
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }
}