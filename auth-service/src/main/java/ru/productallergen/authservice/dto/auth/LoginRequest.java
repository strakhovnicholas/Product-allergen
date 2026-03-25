package ru.productallergen.authservice.dto.auth;

public record LoginRequest(
        String email, String password) {
}
