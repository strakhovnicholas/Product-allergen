package ru.productallergen.userservice.userInfo;

import lombok.Getter;

@Getter
public enum FoodCategory {
    FRUIT("fruit", "Фрукты"),
    VEGETABLE("vegetable", "Овощи"),
    MEAT("meat", "Мясо"),
    FISH("fish", "Рыба"),
    DAIRY("dairy", "Молочное"),
    GRAINS("grains", "Зерно"),
    NUTS("nuts", "Орехи"),
    LEGUMES("legumes", "Бобовые"),
    FAST_FOOD("fast_food", "Фастфуд"),
    BEVERAGES("beverages", "Напитки"),
    SWEETS("sweets", "Сладости"),
    GARNISH("garnish", "Гарнир"),
    SOUP("soup", "Супы"),
    OTHER("other", "Другое");

    private final String dbValue;
    private final String frontName;


    FoodCategory(String value, String frontName) {
        this.dbValue = value;
        this.frontName = frontName;
    }
}
