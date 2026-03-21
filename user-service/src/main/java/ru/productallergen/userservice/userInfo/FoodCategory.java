package ru.productallergen.userservice.userInfo;

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
    OTHER("other");

    private String dbValue;

    FoodCategory(String value) {
        this.dbValue = value;
    }

    public String getDbValue() {
        return dbValue;
    }
}
