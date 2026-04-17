package ru.productallergen.userservice.medicines.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import ru.productallergen.userservice.medicines.entity.Unit;

import java.time.LocalDateTime;

@Schema(description = "Модель запроса для обновления записи о приеме лекарства")
public record IntakeMedicineEditRequestDto(

        @Nullable
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        @Schema(description = "Название лекарства", example = "Парацетамол")
        String medicineName,

        @Nullable
        @Min(value = 0, message = "Dosage must be positive")
        @Schema(description = "Дозировка препарата", example = "500")
        Integer dosage,

        @Nullable
        @Schema(description = "Единица измерения дозировки", example = "MG")
        Unit unit,

        @Nullable
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время приема лекарства", example = "2023-10-27T10:00:00")
        LocalDateTime intakeDate
) {
}