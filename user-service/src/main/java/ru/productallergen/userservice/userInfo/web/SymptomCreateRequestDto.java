package ru.productallergen.userservice.userInfo.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record SymptomCreateRequestDto(
        @NotBlank
        String symptomName,
        @Min(1)
        @Max(10)
        Integer severity,
        @NotNull
        LocalDateTime startTime,
        @NotNull
        LocalDateTime endTime) {
}
