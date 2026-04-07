package ru.productallergen.userservice.foodanalyzer;

import java.util.Map;
import java.util.Set;

/**
 * Сервис для анализа употребленных составляющих блюда
 */
public interface FoodComponentAnalyzerService {
    /**
     * Возвращает список потенциальных симптомов для каждой составляющей блюда
     *
     * @param analyzableInformation информация для анализа
     * @param foodSymptomTime       время, в течение которого выявляется симптом после приема пищи
     * @return список потенциальных симптомов для каждой составляющей блюда
     */
    Map<String, Set<String>> findPotentialSymptomsByFoodComponents(
            AnalyzableInformation analyzableInformation,
            int foodSymptomTime);
}
