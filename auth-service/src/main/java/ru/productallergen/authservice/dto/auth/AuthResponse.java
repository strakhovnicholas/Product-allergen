package ru.productallergen.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

public record AuthResponse(
        String accessToken, String refreshToken) {
}
