package ru.productallergen.authservice;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;
import ru.productallergen.authservice.security.JwtService;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatCode;

@ExtendWith(SpringExtension.class)
class JwtServiceTest {

    private JwtService jwtService;

    private Key testKey;
    private final String testEmail = "test@example.com";
    private final UUID testId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        String secret = "my-very-long-and-secure-test-secret-key-64-bytes-long";
        testKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));

        ReflectionTestUtils.setField(jwtService, "secret", secret);
        ReflectionTestUtils.setField(jwtService, "accessTokenValiditySeconds", 3600);
        ReflectionTestUtils.setField(jwtService, "refreshTokenValiditySeconds", 3600);
        ReflectionTestUtils.setField(jwtService, "idClaim", "id");
        ReflectionTestUtils.setField(jwtService, "typeClaim", "type");
        ReflectionTestUtils.setField(jwtService, "accessTokenType", "access");

        jwtService.init();
    }

    @Test
    void extractId_ShouldWorkCorrectly_WhenIdIsUUID() {
        String email = "test@example.com";
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateAccessToken(email, userId);

        assertThatCode(() -> {
            String extractedId = jwtService.extractId(token);
            assertThat(extractedId).isEqualTo(userId.toString());
        }).doesNotThrowAnyException();
    }

    @Test
    void generateAccessToken_ShouldCreateValidToken() {
        String token = jwtService.generateAccessToken(testEmail, testId);

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();

        String[] parts = token.split("\\.");
        assertThat(parts).hasSize(3);
    }

    @Test
    void generateAccessToken_ShouldContainCorrectSubject() {
        String token = jwtService.generateAccessToken(testEmail, testId);

        String extractedEmail = jwtService.extractEmail(token);
        assertThat(extractedEmail).isEqualTo(testEmail);
    }

    @Test
    void generateAccessToken_ShouldContainCorrectId() {
        String token = jwtService.generateAccessToken(testEmail, testId);

        String extractedId = jwtService.extractId(token);
        assertThat(extractedId).isEqualTo(testId.toString());
    }

    @Test
    void generateAccessToken_ShouldHaveCorrectType() {
        String token = jwtService.generateAccessToken(testEmail, testId);

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
        String token = jwtService.generateAccessToken(testEmail, testId);

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