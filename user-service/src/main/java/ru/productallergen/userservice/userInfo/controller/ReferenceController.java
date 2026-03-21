package ru.productallergen.userservice.userInfo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.web.FoodCategoryResponse;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReferenceController {

    @GetMapping("/reference/food-categories")
    public List<FoodCategoryResponse> getFoodCategories() {
        return Arrays.stream(FoodCategory.values())
                .map(cat -> new FoodCategoryResponse(
                        cat.name(),
                        cat.name(),
                        null
                ))
                .toList();
    }
}

