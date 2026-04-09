package ru.productallergen.userservice.foodanalyzer.dto;

import java.time.ZonedDateTime;

/**
 * Симптом с датой начала и завершения
 */
public record SymptomDate(
        String symptom,
        ZonedDateTime startDateTime,
        ZonedDateTime endDateTime) {
}
