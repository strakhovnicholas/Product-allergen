package ru.productallergen.userservice.food.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import ru.productallergen.userservice.userInfo.FoodCategory;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Модель ответа с информацией о блюде")
public record FoodResponseDto(
        @Schema(description = "Уникальный идентификатор записи", example = "105")
        Long id,

        @Schema(description = "Название блюда", example = "Яблоко", requiredMode = Schema.RequiredMode.REQUIRED)
        String foodName,

        @Schema(description = "Категория блюда", example = "FRUIT", requiredMode = Schema.RequiredMode.REQUIRED)
        FoodCategory category,

        @Schema(description = "Список компонентов блюда")
        List<String> components,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время создания записи", example = "2023-10-27T10:00:00")
        LocalDateTime createdAt,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Дата и время последнего обновления записи", example = "2023-10-27T12:15:00")
        LocalDateTime updatedAt) {
}