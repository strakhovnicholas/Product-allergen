package ru.productallergen.userservice.medicines.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import ru.productallergen.userservice.medicines.entity.Unit;

public record MedicineEditRequestDto(
        @Nullable
        @NotBlank(message = "Medicine name is required")
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        String medicineName,

        @Nullable
        @Min(value = 0)
        Integer dosage,

        @Nullable
        Unit unit) {
}
