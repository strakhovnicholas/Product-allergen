package ru.productallergen.authservice;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import ru.productallergen.authservice.security.JwtService;

import java.security.Key;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class JwtServiceTest {

    @Autowired
    private JwtService jwtService;

    private Key testKey;
    private final String testEmail = "test@example.com";
    private final String testRole = "ROLE_USER";
    private final String testId = "12345";

    @BeforeEach
    void setUp() {
        String secret = "test-secret-key-for-jwt-tests-that-is-at-least-32-bytes-long-for-testing";
        testKey = Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Test
    void generateAccessToken_ShouldCreateValidToken() {
        String token = jwtService.generateAccessToken(testEmail, testRole, testId);

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();

        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
    }

    @Test
    void generateAccessToken_ShouldContainCorrectSubject() {
        String token = jwtService.generateAccessToken(testEmail, testRole, testId);

        String extractedEmail = jwtService.extractEmail(token);
        assertThat(extractedEmail).isEqualTo(testEmail);
    }

    @Test
    void generateAccessToken_ShouldContainCorrectRole() {
        String token = jwtService.generateAccessToken(testEmail, testRole, testId);

        String extractedRole = jwtService.extractRole(token);
        assertThat(extractedRole).isEqualTo(testRole);
    }

    @Test
    void generateAccessToken_ShouldContainCorrectId() {
        String token = jwtService.generateAccessToken(testEmail, testRole, testId);

        String extractedId = jwtService.extractId(token);
        assertThat(extractedId).isEqualTo(testId);
    }

    @Test
    void generateAccessToken_ShouldHaveCorrectType() {
        String token = jwtService.generateAccessToken(testEmail, testRole, testId);

        String extractedType = jwtService.extractType(token);
        assertThat(extractedType).isEqualTo("access");
    }

    @Test
    void generateRefreshToken_ShouldCreateValidToken() {
        String token = jwtService.generateRefreshToken(testEmail);

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();

        String extractedEmail = jwtService.extractEmail(token);
        assertThat(extractedEmail).isEqualTo(testEmail);

        String extractedType = jwtService.extractType(token);
        assertThat(extractedType).isEqualTo("refresh");
    }

    @Test
    void generateAccessToken_ShouldHaveFutureExpiration() {
        String token = jwtService.generateAccessToken(testEmail, testRole, testId);

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(testKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        Date expiration = claims.getExpiration();
        Date now = new Date();

        assertThat(expiration).isAfter(now);
    }
}