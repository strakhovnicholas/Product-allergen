package ru.productallergen.authservice.controller;

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
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("REST request to login user: {}", request.email());
        AuthResponse authResponse = authService.login(request);
        log.info("User {} successfully authenticated", request.email());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        log.info("REST request to register new user: {}", request.email());
        AuthResponse authResponse = authService.register(request);
        log.info("New user registered successfully: {}", request.email());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody LogoutRequest logoutRequest) {
        log.info("REST request to logout");
        authService.logout(logoutRequest.refreshToken());
        return ResponseEntity.ok("Logged out successfully");
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {
        log.info("REST request to refresh token");
        AuthResponse authResponse = authService.refresh(request.refreshToken());
        log.info("Token successfully refreshed");
        return ResponseEntity.ok(authResponse);
    }
}