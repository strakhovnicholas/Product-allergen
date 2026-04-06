package ru.productallergen.authservice.dto.auth;

import java.util.UUID;

public record TokenValidationResponse(
        boolean isValid,
        String email,
        UUID userId,
        String error
) {}
