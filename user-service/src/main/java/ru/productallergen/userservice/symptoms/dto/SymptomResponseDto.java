package ru.productallergen.userservice.symptoms.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.ZonedDateTime;

@Schema(description = "Модель ответа с информацией о симптоме")
public record SymptomResponseDto(

        @Schema(description = "Уникальный идентификатор записи", example = "42")
        Long id,

        @Schema(description = "Название симптома", example = "Головная боль",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String symptomName,

        @Schema(description = "Степень выраженности (1-10)", example = "7",
                requiredMode = Schema.RequiredMode.REQUIRED)
        Integer severity,

        @Schema(description = "Дата и время создания записи", example = "2026-03-21T10:00:00+03:00")
        ZonedDateTime createdAt,

        @Schema(description = "Дата и время последнего обновления", example = "2026-03-21T12:30:00+03:00")
        ZonedDateTime updatedAt
) {
}