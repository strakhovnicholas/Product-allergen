package ru.productallergen.userservice.userInfo;

public enum Gender {
    MALE("male"),
    FEMALE("female");

    private String dbValue;

    Gender(String value) {
        this.dbValue = value;
    }

    public String getDbValue() {
        return dbValue;
    }

}