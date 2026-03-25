package ru.productallergen.authservice.dto.auth;

public record RegisterRequest(
        String email, String password) {
}
