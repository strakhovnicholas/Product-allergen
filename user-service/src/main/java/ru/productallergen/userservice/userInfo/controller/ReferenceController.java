package ru.productallergen.userservice.userInfo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.web.FoodCategoryResponse;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Справочные данные", description = "API для получения справочной информации")
public class ReferenceController {

    @Operation(summary = "Получить список категорий продуктов",
            description = "Возвращает полный список доступных категорий продуктов для использования в системе")
    @GetMapping("/reference/food-categories")
    public ResponseEntity<List<FoodCategoryResponse>> getFoodCategories() {
        List<FoodCategoryResponse> response = Arrays.stream(FoodCategory.values())
                .map(cat -> new FoodCategoryResponse(
                        cat.name(),
                        cat.getFrontName(),
                        null
                ))
                .toList();
        return ResponseEntity.ok(response);
    }
}