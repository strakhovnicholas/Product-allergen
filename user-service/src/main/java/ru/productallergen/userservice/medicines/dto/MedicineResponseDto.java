package ru.productallergen.userservice.medicines.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import ru.productallergen.userservice.medicines.entity.Unit;

import java.time.LocalDateTime;

@Schema(description = "Модель ответа, содержащая информацию о лекарстве")
public record MedicineResponseDto(

        @Schema(description = "Уникальный идентификатор записи",
                example = "105")
        Long id,

        @Schema(description = "Название лекарства",
                example = "Парацетамол",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String medicineName,

        @Schema(description = "Дозировка препарата",
                example = "500", requiredMode = Schema.RequiredMode.REQUIRED)
        Integer dosage,

        @Schema(description = "Единица измерения дозировки (мг, мл, таблетки)",
                example = "MG", requiredMode = Schema.RequiredMode.REQUIRED)
        Unit unit,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время создания записи", example = "2023-10-27T10:00:00")
        LocalDateTime createdAt,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время последнего обновления записи", example = "2023-10-27T12:15:00")
        LocalDateTime updatedAt) {
}