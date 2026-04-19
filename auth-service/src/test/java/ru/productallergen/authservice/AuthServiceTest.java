package ru.productallergen.authservice;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.dto.auth.RegisterRequest;
import ru.productallergen.authservice.entity.User;
import ru.productallergen.authservice.exception.*;
import ru.productallergen.authservice.repository.UserRepository;
import ru.productallergen.authservice.security.JwtService;
import ru.productallergen.authservice.service.auth.AuthService;
import ru.productallergen.authservice.service.storing.RefreshTokenService;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordEncoder,
                authenticationManager,
                jwtService,
                refreshTokenService
        );
    }

    @Test
    void register_WithValidData_ShouldReturnAuthResponse() {
        RegisterRequest request = new RegisterRequest("test@example.com", "password");

        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encoded-password");

        User savedUser = User.builder()
                .id(UUID.randomUUID())
                .email(request.email())
                .password("encoded-password")
                .isActive(true)
                .build();

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateAccessToken(savedUser.getEmail(), savedUser.getId()))
                .thenReturn("access-token");
        when(jwtService.generateRefreshToken(savedUser.getEmail()))
                .thenReturn("refresh-token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");

        verify(userRepository).existsByEmail(request.email());
        verify(userRepository).save(any(User.class));
        verify(refreshTokenService).saveRefreshToken("refresh-token", request.email());
    }

    @Test
    void register_WithExistingEmail_ShouldThrowException() {
        RegisterRequest request = new RegisterRequest("test@example.com", "password");

        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("Пользователь с email test@example.com уже существует");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_WithValidCredentials_ShouldReturnAuthResponse() {
        LoginRequest request = new LoginRequest("test@example.com", "password");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .password("encoded-password")
                .isActive(true)
                .build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user.getEmail(), user.getId()))
                .thenReturn("access-token");
        when(jwtService.generateRefreshToken(user.getEmail()))
                .thenReturn("refresh-token");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");

        verify(authenticationManager).authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        verify(refreshTokenService).revokeOldTokensByEmail(user.getEmail());
        verify(refreshTokenService).saveRefreshToken("refresh-token", user.getEmail());
    }

    @Test
    void login_WithInvalidCredentials_ShouldThrowException() {
        LoginRequest request = new LoginRequest("test@example.com", "wrong-password");

        doThrow(new BadCredentialsException("Invalid credentials"))
                .when(authenticationManager)
                .authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Неверный логин или пароль");

        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void login_WithUserNotFound_ShouldThrowException() {
        LoginRequest request = new LoginRequest("nonexistent@example.com", "password");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessage("Пользователь не найден");
    }

    @Test
    void refresh_WithValidToken_ShouldReturnNewAccessToken() {
        String refreshToken = "valid-refresh-token";
        String email = "test@example.com";

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .isActive(true)
                .build();

        when(jwtService.validateToken(refreshToken, "refresh")).thenReturn(true);
        when(refreshTokenService.isValid(refreshToken)).thenReturn(true);
        when(refreshTokenService.getEmail(refreshToken)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user.getEmail(), user.getId()))
                .thenReturn("new-access-token");

        AuthResponse response = authService.refresh(refreshToken);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("new-access-token");
        assertThat(response.refreshToken()).isEqualTo(refreshToken);
    }

    @Test
    void refresh_WithInvalidJwt_ShouldThrowException() {
        String refreshToken = "invalid-refresh-token";

        when(jwtService.validateToken(refreshToken, "refresh")).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh(refreshToken))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Невалидный refresh токен");
    }

    @Test
    void refresh_WithTokenRevoked_ShouldThrowException() {
        String refreshToken = "revoked-token";

        when(jwtService.validateToken(refreshToken, "refresh")).thenReturn(true);
        when(refreshTokenService.isValid(refreshToken)).thenReturn(false);

        assertThatThrownBy(() -> authService.refresh(refreshToken))
                .isInstanceOf(InvalidRefreshTokenException.class)
                .hasMessage("Refresh токен не найден или отозван");
    }

    @Test
    void logout_ShouldRevokeToken() {
        String refreshToken = "valid-refresh-token";

        authService.logout(refreshToken);

        verify(refreshTokenService).revokeToken(refreshToken);
    }
}