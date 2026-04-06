package ru.productallergen.authservice.service.storing;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    public void saveRefreshToken(String token, String email) {
        this.redisTemplate.opsForValue().set(token, email, REFRESH_TOKEN_TTL);
    }

    public boolean isValid(String token) {
        return this.redisTemplate.hasKey(token);
    }

    public String getEmail(String token) {
        return this.redisTemplate.opsForValue().get(token);
    }

    public void revokeToken(String token) {
        this.redisTemplate.delete(token);
    }
}
