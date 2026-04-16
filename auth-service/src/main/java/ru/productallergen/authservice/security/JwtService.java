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
    private int accessTokenValiditySeconds;

    @Value("${jwt.refresh.expiration}")
    private int refreshTokenValiditySeconds;

    @Value("${jwt.claim.id}")
    private String idClaim;

    @Value("${jwt.claim.type}")
    private String typeClaim;

    @Value("${jwt.claim.token-type}")
    private String accessTokenType;

    private Key SECRET_KEY;

    @PostConstruct
    public void init() {
        log.info("Initializing JwtService with secret from properties...");
        SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email, UUID id) {
        log.debug("Generating Access Token for user: {}", email);
        return Jwts.builder()
                .setSubject(email)
                .claim(idClaim, id)
                .claim(typeClaim, accessTokenType)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValiditySeconds * 1000L))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String email) {
        log.debug("Generating Refresh Token for user: {}", email);
        return Jwts.builder()
                .setSubject(email)
                .claim(typeClaim, "refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValiditySeconds * 1000L))
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
                log.warn("Token validation failed: Expected type {}, but got {}", expectedType, type);
                return false;
            }

            if (expiration.before(new Date())) {
                log.warn("Token validation failed: Token expired at {}", expiration);
                return false;
            }

            return true;
        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
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
            log.debug("JWT token is expired: {}", e.getMessage());
            throw e;
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Could not parse JWT claims: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}