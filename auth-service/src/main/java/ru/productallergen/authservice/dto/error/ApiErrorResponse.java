package ru.productallergen.authservice.dto.error;

import java.time.LocalDateTime;

public record ApiErrorResponse(
        String message,
        int status,
        LocalDateTime timestamp
) {
    public ApiErrorResponse(String message, int status) {
        this(message, status, LocalDateTime.now());
    }
}