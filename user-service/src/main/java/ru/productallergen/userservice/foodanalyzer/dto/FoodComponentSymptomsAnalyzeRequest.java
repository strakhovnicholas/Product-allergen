package ru.productallergen.userservice.foodanalyzer.dto;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.NotNull;

import java.time.ZonedDateTime;

public record FoodComponentSymptomsAnalyzeRequest(
        @Parameter(description = "Дата начала анализа")
        @NotNull
        ZonedDateTime from,
        @NotNull
        @Parameter(description = "Конечная дата анализа")
        ZonedDateTime to) {
}
