package ru.productallergen.gateway.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
@Slf4j
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.claim.id}")
    private String idClaim;

    @Value("${jwt.claim.type}")
    private String typeClaim;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public boolean validateToken(String token, String expectedType) {
        try {
            Claims claims = getAllClaims(token);

            String type = claims.get(typeClaim, String.class);
            boolean isExpired = claims.getExpiration().before(new Date());

            if (!expectedType.equals(type)) {
                log.warn("Валидация токена провалена: ожидался тип '{}', но получен '{}'", expectedType, type);
                return false;
            }

            if (isExpired) {
                log.debug("Валидация токена провалена: срок действия токена истек");
                return false;
            }

            return true;
        } catch (ExpiredJwtException e) {
            log.debug("Валидация токена провалена: время жизни токена закончилось");
        } catch (SignatureException e) {
            log.warn("Валидация токена провалена: некорректная цифровая подпись");
        } catch (MalformedJwtException e) {
            log.warn("Валидация токена провалена: поврежденная структура токена");
        } catch (Exception e) {
            log.error("Валидация токена провалена: непредвиденная ошибка при разборе: {}", e.getMessage());
        }
        return false;
    }

    public String extractId(String token) {
        try {
            Claims claims = getAllClaims(token);
            Object id = claims.get(idClaim);
            return String.valueOf(id);
        } catch (Exception e) {
            log.error("Не удалось извлечь ID из токена: {}", e.getMessage());
            return null;
        }
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}