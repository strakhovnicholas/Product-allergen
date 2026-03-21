package ru.productallergen.userservice.userInfo;

public enum ChronicDisease {
    ASTHMA("asthma"),
    DIABETES("diabetes"),
    HYPERTENSION("hypertension"),
    ARTHRITIS("arthritis");

    private String dbValue;

    ChronicDisease(String value) {
        this.dbValue = value;
    }

    public String getDbValue() {
        return dbValue;
    }
}
