package ru.productallergen.userservice.userInfo.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Schema(description = "Запрос на создание записи о самочувствии")
public record CommonFeelingCreateRequest(
        @NotNull
        @NotBlank
        @Schema(description = "Дата и время фиксации самочувствия")
        LocalDateTime dateTime,

        @NotNull
        @NotBlank
        @Schema(description = "Оценка самочувствия (1-10)")
        Integer wellbeingScore
) {
}