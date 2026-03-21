package ru.productallergen.userservice.medicines.dto;


import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ru.productallergen.userservice.medicines.entity.Unit;

@Schema(description = "Модель запроса, содержащая информацию о лекарстве")
public record MedicineCreateRequestDto(
        @NotBlank(message = "Medicine name is required")
        @Size(min = 2, max = 200,  message = "Name must be between 2 and 200 characters")
        String medicineName,

        @NotNull(message = "Dosage is required")
        @Min(value = 0)
        Integer dosage,

        @NotNull(message = "Unit is required")
        Unit unit) {
}