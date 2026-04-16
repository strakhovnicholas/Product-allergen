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
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String type = claims.get(typeClaim, String.class);
            boolean isExpired = claims.getExpiration().before(new Date());

            if (!expectedType.equals(type)) {
                log.warn("Token validation failed: Expected type '{}', but found '{}'", expectedType, type);
                return false;
            }

            if (isExpired) {
                log.debug("Token validation failed: Token is expired");
                return false;
            }

            return true;
        } catch (ExpiredJwtException e) {
            log.debug("Token validation failed: Token has expired");
        } catch (SignatureException e) {
            log.warn("Token validation failed: Invalid signature");
        } catch (MalformedJwtException e) {
            log.warn("Token validation failed: Malformed token structure");
        } catch (Exception e) {
            log.error("Token validation failed: Unexpected error during parsing: {}", e.getMessage());
        }
        return false;
    }

    public String extractId(String token) {
        try {
            Object id = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get(idClaim);
            return String.valueOf(id);
        } catch (Exception e) {
            log.error("Failed to extract ID from token: {}", e.getMessage());
            return null;
        }
    }
}