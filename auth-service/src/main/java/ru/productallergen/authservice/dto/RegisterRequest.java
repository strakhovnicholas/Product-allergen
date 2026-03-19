package ru.productallergen.authservice.dto;

public record RegisterRequest(
        String email, String password) {
}
