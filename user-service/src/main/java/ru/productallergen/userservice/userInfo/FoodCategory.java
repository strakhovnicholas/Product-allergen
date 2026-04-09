package ru.productallergen.userservice.userInfo;

import lombok.Getter;

@Getter
public enum FoodCategory {
    FRUIT("fruit"),
    VEGETABLE("vegetable"),
    MEAT("meat"),
    FISH("fish"),
    DAIRY("dairy"),
    GRAINS("grains"),
    NUTS("nuts"),
    LEGUMES("legumes"),
    FAST_FOOD("fast_food"),
    BEVERAGES("beverages"),
    SWEETS("sweets"),
    GARNISH("garnish"),
    SOUP("soup"),
    OTHER("other");

    private final String dbValue;

    FoodCategory(String value) {
        this.dbValue = value;
    }
}
