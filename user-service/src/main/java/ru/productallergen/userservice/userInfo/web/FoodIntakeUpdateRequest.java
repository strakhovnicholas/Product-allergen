package ru.productallergen.userservice.userInfo.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;

import java.time.LocalDateTime;
import java.util.List;

@Schema(description = "Запрос на создание/обновление данных о приеме пищи")
public record FoodIntakeUpdateRequest(
        @Schema(description = "Название продукта или блюда")
        @NotNull
        @NotBlank
        String foodName,

        @Schema(description = "Категория продукта")
        @NotNull
        FoodCategory category,

        @Schema(description = "Количество съеденного продукта")
        @NotNull
        Double amount,

        @Schema(description = "Единица измерения количества")
        @NotNull
        FoodUnit unit,

        @Schema(description = "Время создания приёма пищи")
        @NotNull
        LocalDateTime createdAt,

        @Schema(description = "Время приема пищи")
        @NotNull
        LocalDateTime intakeTime,

        @Schema(description = "Была ли реакция на продукт")
        Boolean reactionOccurred,

        @Schema(description = "Описание реакции (если была)")
        String reactionDescription,

        @Schema(description = "Список компонентов/ингредиентов блюда")
        List<String> components
) {
}
