package ru.productallergen.userservice.foodanalyzer;

import java.time.ZonedDateTime;

/**
 * Составляющая еды с датой потребления
 */
public record FoodComponentDate(
        String foodComponent,
        ZonedDateTime dateTime) {
}
