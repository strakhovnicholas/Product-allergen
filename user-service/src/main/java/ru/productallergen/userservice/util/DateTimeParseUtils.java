package ru.productallergen.userservice.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public final class DateTimeParseUtils {

    private static final DateTimeFormatter BACKEND_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private DateTimeParseUtils() {
    }

    public static LocalDateTime parseRequired(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " обязателен");
        }
        return parse(value.trim(), fieldName);
    }

    public static LocalDateTime parseOptional(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return parse(value.trim(), fieldName);
    }

    private static LocalDateTime parse(String normalized, String fieldName) {
        String candidate = normalized.length() == 16 ? normalized + ":00" : normalized;
        try {
            return LocalDateTime.parse(candidate, BACKEND_FORMAT);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException(
                    "Некорректный формат " + fieldName + ": ожидается yyyy-MM-dd'T'HH:mm:ss");
        }
    }
}
