package ru.productallergen.userservice.medicines.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import ru.productallergen.userservice.medicines.entity.Unit;

import java.time.LocalDateTime;

@Schema(description = "Модель ответа, содержащая информацию о принятом лекарстве")
public record IntakeMedicineResponseDto(

        @Schema(description = "Уникальный идентификатор записи", example = "205")
        Long id,

        @Schema(description = "Название лекарства на момент приема", example = "Парацетамол")
        String medicineName,

        @Schema(description = "Дозировка препарата на момент приема", example = "500")
        Integer dosage,

        @Schema(description = "Единица измерения дозировки", example = "MG")
        Unit unit,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время приема", example = "2023-10-27T10:00:00")
        LocalDateTime intakeDate,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время создания записи", example = "2023-10-27T10:00:00")
        LocalDateTime createdAt,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время последнего обновления", example = "2023-10-27T12:15:00")
        LocalDateTime updatedAt
) {
}