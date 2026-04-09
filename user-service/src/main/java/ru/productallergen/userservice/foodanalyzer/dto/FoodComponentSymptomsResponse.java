package ru.productallergen.userservice.foodanalyzer.dto;

import java.util.List;

/**
 * Потенциальный список симптомов от употребленного компонента еды
 */
public record FoodComponentSymptomsResponse(
        String foodComponentName,
        List<String> symptomsName) {
}
