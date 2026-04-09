package ru.productallergen.authservice.service.storing;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);
    private static final String USER_TOKENS_PREFIX = "user_tokens:";

    public void saveRefreshToken(String token, String email) {
        redisTemplate.opsForValue().set(token, email, REFRESH_TOKEN_TTL);

        String userTokensKey = USER_TOKENS_PREFIX + email;
        redisTemplate.opsForSet().add(userTokensKey, token);
        redisTemplate.expire(userTokensKey, REFRESH_TOKEN_TTL);
    }

    public void revokeOldTokensByEmail(String email) {
        String userTokensKey = USER_TOKENS_PREFIX + email;
        Set<String> tokens = redisTemplate.opsForSet().members(userTokensKey);

        if (tokens != null) {
            for (String token : tokens) {
                redisTemplate.delete(token);
            }
            redisTemplate.delete(userTokensKey);
        }
    }

    public boolean isValid(String token) {
        return redisTemplate.hasKey(token);
    }

    public String getEmail(String token) {
        return redisTemplate.opsForValue().get(token);
    }

    public void revokeToken(String token) {
        String email = getEmail(token);
        if (email != null) {
            String userTokensKey = USER_TOKENS_PREFIX + email;
            redisTemplate.opsForSet().remove(userTokensKey, token);
            redisTemplate.delete(token);
        }
    }
}