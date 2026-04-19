package ru.productallergen.userservice.userInfo.web;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(description = "DTO для передачи данных о приеме пищи")
public record FoodIntakeWebDto(

        @Schema(description = "Уникальный идентификатор приема пищи")
        UUID foodIntakeId,

        @Schema(description = "Уникальный идентификатор пользователя")
        UUID userId,

        @Schema(description = "Название продукта или блюда")
        String foodName,

        @Schema(description = "Категория продукта")
        FoodCategory category,

        @Schema(description = "Количество съеденного продукта")
        Double amount,

        @Schema(description = "Единица измерения количества")
        FoodUnit unit,

        @Schema(description = "Время приема пищи")
        LocalDateTime intakeTime,

        @Schema(description = "Дата и время создания записи")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt,

        @Schema(description = "Список компонентов/ингредиентов блюда")
        List<String> components
) {
}