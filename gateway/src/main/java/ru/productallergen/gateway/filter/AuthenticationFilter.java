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
            HttpHeaders headers = request.getHeaders();

            if (config.skipAuth) {
                ServerHttpRequest mutated = request.mutate()
                        .header(X_USER_ID, TEST_USER_ID)
                        .header(X_INTERNAL_TOKEN, internalSecret)
                        .build();

                return chain.filter(exchange.mutate().request(mutated).build());
            }

            if (!headers.containsKey(HttpHeaders.AUTHORIZATION)) {
                return Mono.error(new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Authorization header is missing"));
            }

            String authHeader = headers.getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Authorization header format"));
            }

            String token = authHeader.substring(BEARER_OFFSET);
            if (!jwtUtils.validateToken(token, EXPECTED_TOKEN_TYPE)) {
                return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired access token"));
            }

            String userId = jwtUtils.extractId(token);
            ServerHttpRequest modifiedRequest = request.mutate()
                    .header(X_USER_ID, userId)
                    .header(X_INTERNAL_TOKEN, internalSecret)
                    .build();

            return chain.filter(exchange.mutate().request(modifiedRequest).build());
        };
    }
}