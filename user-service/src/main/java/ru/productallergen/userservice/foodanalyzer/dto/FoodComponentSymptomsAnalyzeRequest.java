package ru.productallergen.userservice.foodanalyzer.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record FoodComponentSymptomsAnalyzeRequest(
        @Parameter(description = "Дата начала анализа")
        @NotNull
        LocalDateTime from,
        @NotNull
        @Parameter(description = "Конечная дата анализа")
        LocalDateTime to) {
}
