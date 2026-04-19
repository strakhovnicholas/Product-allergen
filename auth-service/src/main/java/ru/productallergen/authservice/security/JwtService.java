package ru.productallergen.authservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expiration}")
    private int accessTokenValidityMillis;

    @Value("${jwt.refresh.expiration}")
    private int refreshTokenValidityMillis;

    @Value("${jwt.claim.id}")
    private String idClaim;

    @Value("${jwt.claim.type}")
    private String typeClaim;

    @Value("${jwt.claim.token-type}")
    private String accessTokenType;

    private Key SECRET_KEY;

    @PostConstruct
    public void init() {
        log.info("Инициализация JwtService: создание ключа подписи из конфигурации...");
        SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email, UUID id) {
        log.debug("Генерация Access токена для пользователя: {}", email);
        return Jwts.builder()
                .setSubject(email)
                .claim(idClaim, id)
                .claim(typeClaim, accessTokenType)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValidityMillis))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String email) {
        log.debug("Генерация Refresh токена для пользователя: {}", email);
        return Jwts.builder()
                .setSubject(email)
                .claim(typeClaim, "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidityMillis))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String extractId(String token) {
        return getClaims(token).get(idClaim, String.class);
    }

    public String extractType(String token) {
        return getClaims(token).get(typeClaim, String.class);
    }

    public boolean validateToken(String token, String expectedType) {
        try {
            Claims claims = getClaims(token);
            String type = claims.get(typeClaim, String.class);
            Date expiration = claims.getExpiration();

            if (!expectedType.equals(type)) {
                log.warn("Валидация токена провалена: ожидался тип {}, но получен {}", expectedType, type);
                return false;
            }

            if (expiration.before(new Date())) {
                log.warn("Валидация токена провалена: срок действия истек в {}", expiration);
                return false;
            }

            return true;
        } catch (Exception e) {
            log.warn("Ошибка валидации токена: {}", e.getMessage());
            return false;
        }
    }

    private Claims getClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            log.debug("Срок действия JWT токена истек: {}", e.getMessage());
            throw e;
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.error("Некорректная структура JWT токена: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Не удалось прочитать данные (claims) из JWT: {}", e.getMessage());
            throw new RuntimeException("Ошибка разбора JWT токена", e);
        }
    }
}