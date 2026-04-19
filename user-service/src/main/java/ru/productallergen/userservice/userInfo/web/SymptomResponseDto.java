package ru.productallergen.userservice.userInfo.web;

import java.time.LocalDateTime;
import java.util.UUID;

public record SymptomResponseDto(
        UUID symptomsId,
        String symptomName,
        Integer severity,
        LocalDateTime startTime,
        LocalDateTime endTime
) {
}
