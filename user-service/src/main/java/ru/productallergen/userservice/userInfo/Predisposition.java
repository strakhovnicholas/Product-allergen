package ru.productallergen.userservice.userInfo;

public enum Predisposition {
    NONE ("none"),
    LOW("low"),
    MEDIUM("medium"),
    HIGH("high");

    private String dbValue;

    Predisposition(String value) {
        this.dbValue = value;
    }

    public String getDbValue() {
        return dbValue;
    }
}
