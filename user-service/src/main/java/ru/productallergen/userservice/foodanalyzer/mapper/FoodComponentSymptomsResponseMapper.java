package ru.productallergen.userservice.foodanalyzer.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentSymptomsResponse;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class FoodComponentSymptomsResponseMapper {
    public List<FoodComponentSymptomsResponse> map(Map<String, Set<String>> symptomsByFoodComponents) {
        List<FoodComponentSymptomsResponse> foodComponentSymptomsResponses = new ArrayList<>(
                symptomsByFoodComponents.size());
        for (Map.Entry<String, Set<String>> symptomsByFoodComponent : symptomsByFoodComponents.entrySet()) {
            FoodComponentSymptomsResponse foodComponentSymptomsResponse = map(
                    symptomsByFoodComponent.getKey(),
                    symptomsByFoodComponent.getValue());

            foodComponentSymptomsResponses.add(foodComponentSymptomsResponse);
        }
        return foodComponentSymptomsResponses;
    }

    private FoodComponentSymptomsResponse map(String foodComponentName, Set<String> symptomNames) {
        return new FoodComponentSymptomsResponse(foodComponentName, new ArrayList<>(symptomNames));
    }
}
