package ru.productallergen.userservice.foodanalyzer.dto;

import java.time.LocalDateTime;

/**
 * Компонент еды с датой потребления
 */
public record FoodComponentDate(
        String foodComponent,
        LocalDateTime dateTime) {
}
