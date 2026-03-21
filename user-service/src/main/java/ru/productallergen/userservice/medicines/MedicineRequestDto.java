package ru.productallergen.userservice.medicines;


import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.ZonedDateTime;

public record MedicineRequestDto(
        @NotBlank(message = "Medicine name is required")
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        String medicineName,

        @NotNull(message = "Dosage is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Dosage must be positive")
        Integer dosage,

        @NotNull(message = "Unit is required")
        MedicineEntity.Unit unit,

        @NotNull(message = "Intake time is required")
        @FutureOrPresent(message = "Intake time must be now or in the future")
        ZonedDateTime intakeTime,

        @NotNull(message = "Medication type is required")
        @Min(value = 1, message = "Medication type must be positive")
        @Max(value = 999, message = "Medication type must be between 1 and 999")
        Integer medicationType) {
}