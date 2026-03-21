package ru.productallergen.userservice.symptoms.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.*;

@Schema(description = "Модель запроса для обновления симптома")
public record SymptomEditRequestDto(

        @Nullable
        @NotBlank(message = "Symptom name cannot be empty")
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        @Schema(description = "Название симптома", example = "Тошнота")
        String symptomName,

        @Nullable
        @Min(value = 1, message = "Severity must be at least 1")
        @Max(value = 10, message = "Severity must not exceed 10")
        @Schema(description = "Степень выраженности симптома (1-10)", example = "5")
        Integer severity
) {
}