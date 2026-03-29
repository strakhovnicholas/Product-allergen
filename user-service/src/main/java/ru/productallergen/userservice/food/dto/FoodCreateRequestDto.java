package ru.productallergen.userservice.food.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ru.productallergen.userservice.userInfo.FoodCategory;

import java.util.List;

@Schema(description = "Модель запроса для создания блюда")
public record FoodCreateRequestDto(
        @NotBlank(message = "Food name is required")
        @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
        String foodName,

        @NotNull(message = "Category is required")
        @Schema(description = "Категория блюда", example = "FRUIT", requiredMode = Schema.RequiredMode.REQUIRED)
        FoodCategory category,

        @Schema(description = "Список компонентов блюда")
        List<String> components) {
}