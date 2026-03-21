package ru.productallergen.userservice.symptoms.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Модель запроса для создания симптома")
public record SymptomCreateRequestDto(

        @NotBlank(message = "Symptom name is required")
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        @Schema(description = "Название симптома",
                example = "Головная боль",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String symptomName,

        @NotNull(message = "Severity is required")
        @Min(value = 1, message = "Severity must be at least 1")
        @Max(value = 10, message = "Severity must not exceed 10")
        @Schema(description = "Степень выраженности симптома (1-10)",
                example = "7",
                requiredMode = Schema.RequiredMode.REQUIRED)
        Integer severity
) {
}