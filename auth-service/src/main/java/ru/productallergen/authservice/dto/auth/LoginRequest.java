package ru.productallergen.authservice.dto;

public record LoginRequest(
        String email, String password) {
}
