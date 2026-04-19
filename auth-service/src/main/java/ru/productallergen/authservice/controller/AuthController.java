package ru.productallergen.authservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.authservice.dto.auth.*;
import ru.productallergen.authservice.service.auth.AuthService;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Аутентификация", description = "Методы для регистрации, входа и управления токенами")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Вход в систему", description = "Возвращает Access и Refresh токены при успешной проверке учетных данных")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Успешный вход"),
            @ApiResponse(responseCode = "401", description = "Неверный логин или пароль", content = @Content),
            @ApiResponse(responseCode = "400", description = "Ошибка валидации данных", content = @Content)
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("REST запрос на вход пользователя: {}", request.email());
        AuthResponse authResponse = authService.login(request);
        log.info("Пользователь {} успешно прошел аутентификацию", request.email());
        return ResponseEntity.ok(authResponse);
    }

    @Operation(summary = "Регистрация нового пользователя")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Пользователь успешно создан"),
            @ApiResponse(responseCode = "409", description = "Пользователь с таким email уже существует")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("REST запрос на регистрацию нового пользователя: {}", request.email());
        AuthResponse authResponse = authService.register(request);
        log.info("Новый пользователь успешно зарегистрирован: {}", request.email());
        return ResponseEntity.ok(authResponse);
    }

    @Operation(summary = "Выход из системы", description = "Инвалидирует Refresh токен пользователя")
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@Valid @RequestBody LogoutRequest logoutRequest) {
        log.info("REST запрос на выход из системы");
        authService.logout(logoutRequest.refreshToken());
        log.info("Пользователь успешно вышел из системы");
        return ResponseEntity.ok("Выход выполнен успешно");
    }

    @Operation(summary = "Обновление пары токенов", description = "Использует действующий Refresh токен для получения новой пары Access/Refresh")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        log.info("REST запрос на обновление токена");
        AuthResponse authResponse = authService.refresh(request.refreshToken());
        log.info("Токен успешно обновлен");
        return ResponseEntity.ok(authResponse);
    }
}