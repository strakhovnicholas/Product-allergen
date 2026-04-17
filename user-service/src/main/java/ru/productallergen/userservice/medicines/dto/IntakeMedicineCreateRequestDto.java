package ru.productallergen.userservice.medicines.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ru.productallergen.userservice.medicines.entity.Unit;

import java.time.LocalDateTime;

@Schema(description = "Модель запроса для создания записи о приеме лекарства")
public record IntakeMedicineCreateRequestDto(

        @NotBlank(message = "Medicine name is required")
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        @Schema(description = "Название лекарства", example = "Парацетамол", requiredMode = Schema.RequiredMode.REQUIRED)
        String medicineName,

        @NotNull(message = "Dosage is required")
        @Min(value = 0, message = "Dosage must be positive")
        @Schema(description = "Дозировка препарата", example = "500", requiredMode = Schema.RequiredMode.REQUIRED)
        Integer dosage,

        @NotNull(message = "Unit is required")
        @Schema(description = "Единица измерения дозировки", example = "MG", requiredMode = Schema.RequiredMode.REQUIRED)
        Unit unit,

        @NotNull(message = "Intake date is required")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время приема лекарства", example = "2023-10-27T10:00:00", requiredMode = Schema.RequiredMode.REQUIRED)
        LocalDateTime intakeDate
) {
}