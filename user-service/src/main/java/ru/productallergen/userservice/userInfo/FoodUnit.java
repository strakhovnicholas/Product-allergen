package ru.productallergen.userservice.userInfo;

public enum FoodUnit {
    GRAM("gram"),
    PORTION("portion"),
    PIECE("piece"),
    MILLILITER("milliliter");

    private String dbValue;

    FoodUnit(String value) {
        this.dbValue = value;
    }

    public String getDbValue() {
        return dbValue;
    }
}
