package ru.productallergen.userservice.food.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Size;
import ru.productallergen.userservice.userInfo.FoodCategory;

import java.util.List;

@Schema(description = "Модель запроса для редактирования блюда")
public record FoodEditRequestDto(
        @Nullable
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        String foodName,

        @Nullable
        @Schema(description = "Категория блюда", example = "FRUIT")
        FoodCategory category,

        @Nullable
        @Schema(description = "Список компонентов блюда")
        List<String> components) {
}