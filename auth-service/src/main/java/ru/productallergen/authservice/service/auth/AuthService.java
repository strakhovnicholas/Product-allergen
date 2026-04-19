package ru.productallergen.authservice.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.dto.auth.RegisterRequest;
import ru.productallergen.authservice.entity.User;
import ru.productallergen.authservice.exception.*;
import ru.productallergen.authservice.repository.UserRepository;
import ru.productallergen.authservice.security.JwtService;
import ru.productallergen.authservice.service.storing.RefreshTokenService;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Попытка регистрации нового пользователя с email: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            log.warn("Ошибка регистрации: пользователь с email {} уже существует", request.email());
            throw new UserAlreadyExistsException("Пользователь с email " + request.email() + " уже существует");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("Пользователь успешно зарегистрирован. ID: {}", user.getId());

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenService.saveRefreshToken(refreshToken, user.getEmail());

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Попытка входа для пользователя: {}", request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (Exception e) {
            log.warn("Ошибка входа для пользователя {}: неверные учетные данные", request.email());
            throw new InvalidCredentialsException("Неверный логин или пароль");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    log.error("Критическая ошибка входа: пользователь {} прошел аутентификацию, но не найден в БД", request.email());
                    return new UserNotFoundException("Пользователь не найден");
                });

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenService.revokeOldTokensByEmail(user.getEmail());
        refreshTokenService.saveRefreshToken(refreshToken, user.getEmail());

        log.info("Пользователь {} успешно вошел в систему. Выданы новые токены.", request.email());
        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse refresh(String refreshToken) {
        log.info("Попытка обновления access токена через refresh токен");

        if (!jwtService.validateToken(refreshToken, "refresh")) {
            log.warn("Ошибка обновления: подпись или срок действия токена невалидны");
            throw new InvalidRefreshTokenException("Невалидный refresh токен");
        }

        if (!refreshTokenService.isValid(refreshToken)) {
            log.warn("Ошибка обновления: токен отозван или отсутствует в хранилище");
            throw new InvalidRefreshTokenException("Refresh токен не найден или отозван");
        }

        String email = refreshTokenService.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Критическая ошибка обновления: пользователь {} не найден для валидного токена", email);
                    return new UserNotFoundException("Пользователь не найден");
                });

        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        log.info("Access токен успешно обновлен для пользователя: {}", email);

        return new AuthResponse(newAccessToken, refreshToken);
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            log.info("Выход из системы: отзыв refresh токена");
            refreshTokenService.revokeToken(refreshToken);
        } else {
            log.debug("Метод logout вызван с пустым токеном");
        }
    }
}