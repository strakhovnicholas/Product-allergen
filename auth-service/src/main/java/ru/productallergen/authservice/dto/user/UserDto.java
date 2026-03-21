package ru.productallergen.authservice.dto.user;

import lombok.Builder;

@Builder
public record UserDto(
        String id, String email, String role) {
}
