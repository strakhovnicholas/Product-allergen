package ru.productallergen.userservice.foodanalyzer.dto;

import java.time.ZonedDateTime;

/**
 * Компонент еды с датой потребления
 */
public record FoodComponentDate(
        String foodComponent,
        ZonedDateTime dateTime) {
}
