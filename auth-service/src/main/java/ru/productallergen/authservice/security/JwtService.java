package ru.productallergen.authservice.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

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

    @Value("${jwt.claim.role}")
    private String roleClaim;

    @Value("${jwt.claim.type}")
    private String typeClaim;

    @Value("${jwt.claim.token-type}")
    private String accessTokenType;

    private Key SECRET_KEY;

    @PostConstruct
    public void init() {
        SECRET_KEY = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email, String role, String id) {
        return Jwts.builder()
                .setSubject(email)
                .claim(idClaim, id)
                .claim(roleClaim, role)
                .claim(typeClaim, accessTokenType)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValiditySeconds * 1000L))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String email) {
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

    public String extractRole(String token) {
        return getClaims(token).get(roleClaim, String.class);
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
            return expectedType.equals(type) && expiration.after(new Date());
        } catch (Exception e) {
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
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}