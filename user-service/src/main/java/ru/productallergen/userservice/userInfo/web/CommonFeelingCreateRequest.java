package ru.productallergen.userservice.userInfo.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Запрос на создание записи о самочувствии")
public record CommonFeelingCreateRequest(
        @NotNull
        @NotBlank
        @Schema(description = "Оценка самочувствия (1-10)")
        Integer wellbeingScore
) {
}