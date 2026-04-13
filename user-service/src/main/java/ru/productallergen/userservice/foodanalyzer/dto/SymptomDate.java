package ru.productallergen.userservice.foodanalyzer.dto;

import java.time.LocalDateTime;

/**
 * Симптом с датой начала и завершения
 */
public record SymptomDate(
        String symptom,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime) {
}
