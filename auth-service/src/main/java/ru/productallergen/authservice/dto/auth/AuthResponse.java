package ru.productallergen.authservice.dto.auth;

public record AuthResponse(
        String accessToken, String refreshToken) {
}
