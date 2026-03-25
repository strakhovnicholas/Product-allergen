package ru.productallergen.authservice;

import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.util.StreamUtils;
import org.springframework.web.reactive.function.client.WebClient;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.security.JwtService;
import ru.productallergen.authservice.service.auth.AuthService;
import ru.productallergen.authservice.service.storing.RefreshTokenService;

import java.io.IOException;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private MockWebServer mockWebServer;
    private WebClient webClient;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthService authService;

    @BeforeEach
    void setUp() throws Exception {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        webClient = WebClient.builder()
                .baseUrl(mockWebServer.url("/").toString())
                .build();

        authService = new AuthService(jwtService, webClient, refreshTokenService);

        ReflectionTestUtils.setField(authService, "getUserByEmailPath", "/api/users/email/{email}");
        ReflectionTestUtils.setField(authService, "getUserPasswordById", "/api/users/{id}/password");
        ReflectionTestUtils.setField(authService, "postCreateUser", "/api/users");
    }

    @AfterEach
    void tearDown() throws Exception {
        mockWebServer.shutdown();
    }

    @Test
    void login_WithValidCredentials_ShouldReturnAuthResponse() throws IOException {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "password");

        ClassPathResource resource = new ClassPathResource("user-response.json");
        String userResponse = StreamUtils.copyToString(resource.getInputStream(), java.nio.charset.StandardCharsets.UTF_8);

        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody(userResponse)
                .addHeader("Content-Type", "application/json"));

        mockWebServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setBody("true")
                .addHeader("Content-Type", "application/json"));

        when(jwtService.generateAccessToken(anyString(), anyString(), anyString()))
                .thenReturn("access-token");
        when(jwtService.generateRefreshToken(anyString()))
                .thenReturn("refresh-token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");

        verify(refreshTokenService).saveRefreshToken("refresh-token", "test@example.com");
    }
}