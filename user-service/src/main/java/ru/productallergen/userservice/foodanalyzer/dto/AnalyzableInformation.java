package ru.productallergen.userservice.foodanalyzer.dto;

import java.util.List;

/**
 * Информация для анализа
 */
public record AnalyzableInformation(List<FoodComponentDate> foodComponentsDates,
                                    List<SymptomDate> symptomDates) {
}
