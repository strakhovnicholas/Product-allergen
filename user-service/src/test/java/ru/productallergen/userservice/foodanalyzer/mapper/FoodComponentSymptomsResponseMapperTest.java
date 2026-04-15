package ru.productallergen.userservice.foodanalyzer.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentSymptomsResponse;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class FoodComponentSymptomsResponseMapperTest {

    private FoodComponentSymptomsResponseMapper underTest;

    @BeforeEach
    void setUp() {
        underTest = new FoodComponentSymptomsResponseMapper();
    }

    private void assertEqualsIgnoreOrder(List<FoodComponentSymptomsResponse> expected,
                                         List<FoodComponentSymptomsResponse> actual) {
        List<FoodComponentSymptomsResponse> normalizedExpected = normalizeSymptomsLists(expected);
        List<FoodComponentSymptomsResponse> normalizedActual = normalizeSymptomsLists(actual);

        assertThat(normalizedActual)
                .usingRecursiveFieldByFieldElementComparator()
                .containsExactlyInAnyOrderElementsOf(normalizedExpected);
    }

    private List<FoodComponentSymptomsResponse> normalizeSymptomsLists(List<FoodComponentSymptomsResponse> responses) {
        return responses.stream()
                .map(response -> {
                    List<String> sortedSymptoms = new ArrayList<>(response.symptomsName());
                    sortedSymptoms.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
                    return new FoodComponentSymptomsResponse(response.foodComponentName(), sortedSymptoms);
                })
                .toList();
    }

    @Test
    void map_WithSingleFoodComponentAndMultipleSymptoms_ShouldReturnCorrectResponse() {
        String foodComponent = "Egg";
        Set<String> symptoms = Set.of("Rash", "Nausea", "Headache");
        Map<String, Set<String>> symptomsByFoodComponents = Map.of(foodComponent, symptoms);

        List<FoodComponentSymptomsResponse> expected = List.of(
                new FoodComponentSymptomsResponse("Egg", List.of("Headache", "Nausea", "Rash"))
        );
        List<FoodComponentSymptomsResponse> result = underTest.map(symptomsByFoodComponents);

        assertEqualsIgnoreOrder(expected, result);
    }

    @Test
    void map_WithMultipleFoodComponents_ShouldReturnAllResponses() {
        Map<String, Set<String>> symptomsByFoodComponents = Map.of(
                "Egg", Set.of("Rash", "Nausea"),
                "Milk", Set.of("Bloating", "Diarrhea"),
                "Peanut", Set.of("Anaphylaxis", "Hives")
        );

        List<FoodComponentSymptomsResponse> expected = List.of(
                new FoodComponentSymptomsResponse("Egg", List.of("Nausea", "Rash")),
                new FoodComponentSymptomsResponse("Milk", List.of("Bloating", "Diarrhea")),
                new FoodComponentSymptomsResponse("Peanut", List.of("Anaphylaxis", "Hives"))
        );

        List<FoodComponentSymptomsResponse> result = underTest.map(symptomsByFoodComponents);

        assertEqualsIgnoreOrder(expected, result);
    }

    @Test
    void map_WithFoodComponentAndEmptySymptomsSet_ShouldReturnResponseWithEmptyList() {
        String foodComponent = "Wheat";
        Set<String> symptoms = Set.of();
        Map<String, Set<String>> symptomsByFoodComponents = Map.of(foodComponent, symptoms);

        List<FoodComponentSymptomsResponse> expected = List.of(
                new FoodComponentSymptomsResponse("Wheat", List.of())
        );
        List<FoodComponentSymptomsResponse> result = underTest.map(symptomsByFoodComponents);

        assertEqualsIgnoreOrder(expected, result);
    }

    @Test
    void map_WithFoodComponentAndSingleSymptom_ShouldReturnResponseWithOneSymptom() {
        String foodComponent = "Fish";
        Set<String> symptoms = Set.of("Hives");
        Map<String, Set<String>> symptomsByFoodComponents = Map.of(foodComponent, symptoms);

        List<FoodComponentSymptomsResponse> expected = List.of(
                new FoodComponentSymptomsResponse("Fish", List.of("Hives"))
        );
        List<FoodComponentSymptomsResponse> result = underTest.map(symptomsByFoodComponents);

        assertEqualsIgnoreOrder(expected, result);
    }

    @Test
    void map_WithEmptyMap_ShouldReturnEmptyList() {
        Map<String, Set<String>> symptomsByFoodComponents = Map.of();
        List<FoodComponentSymptomsResponse> expected = List.of();

        List<FoodComponentSymptomsResponse> result = underTest.map(symptomsByFoodComponents);

        assertEqualsIgnoreOrder(expected, result);
    }

    @Test
    void map_WithMultipleFoodComponentsSameSymptoms_ShouldReturnAllResponses() {

        Map<String, Set<String>> symptomsByFoodComponents = Map.of(
                "Component1", Set.of("SymptomA", "SymptomB"),
                "Component2", Set.of("SymptomA", "SymptomB"),
                "Component3", Set.of("SymptomC")
        );

        List<FoodComponentSymptomsResponse> expected = List.of(
                new FoodComponentSymptomsResponse("Component1", List.of("SymptomA", "SymptomB")),
                new FoodComponentSymptomsResponse("Component2", List.of("SymptomB", "SymptomA")),
                new FoodComponentSymptomsResponse("Component3", List.of("SymptomC"))
        );


        List<FoodComponentSymptomsResponse> result = underTest.map(symptomsByFoodComponents);
        assertEqualsIgnoreOrder(expected, result);
    }
}