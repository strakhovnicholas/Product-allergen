package ru.productallergen.userservice.foodanalyzer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ru.productallergen.userservice.foodanalyzer.dto.AnalyzableInformation;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentDate;
import ru.productallergen.userservice.foodanalyzer.dto.SymptomDate;
import ru.productallergen.userservice.foodanalyzer.service.FoodComponentAnalyzerServiceImpl;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

class FoodComponentAnalyzerServiceImplTest {

    private static final ZonedDateTime DEFAULT_ZONED_TIME = ZonedDateTime.now();

    private FoodComponentAnalyzerServiceImpl underTest;

    @BeforeEach
    void init() {
        underTest = new FoodComponentAnalyzerServiceImpl();
    }

    @Test
    void findPotentialSymptomsByFoodComponents_symptomTimeLessSymptomDate_thenFoodComponentHaveNotSymptoms() {
        AnalyzableInformation analyzableInformation = new AnalyzableInformation(
                List.of(new FoodComponentDate("comp1", DEFAULT_ZONED_TIME),
                        new FoodComponentDate("comp2", DEFAULT_ZONED_TIME)),
                List.of(new SymptomDate("symptom1",
                        DEFAULT_ZONED_TIME.plusHours(10),
                        DEFAULT_ZONED_TIME.plusHours(11)))
        );

        Map<String, Set<String>> expected = Map.of(
                "comp1", Set.of(),
                "comp2", Set.of()
        );

        Map<String, Set<String>> result = underTest
                .findPotentialSymptomsByFoodComponents(analyzableInformation, 5);
        assert result.equals(expected);
    }

    @Test
    void findPotentialSymptomsByFoodComponents_symptomTimeMoreSymptomDate_thenFoodComponentHaveSymptoms() {
        AnalyzableInformation analyzableInformation = new AnalyzableInformation(
                List.of(new FoodComponentDate("comp1", DEFAULT_ZONED_TIME),
                        new FoodComponentDate("comp2", DEFAULT_ZONED_TIME)),
                List.of(new SymptomDate("symptom1",
                        DEFAULT_ZONED_TIME.plusHours(10),
                        DEFAULT_ZONED_TIME.plusHours(11)),
                        new SymptomDate("symptom2",
                                DEFAULT_ZONED_TIME.plusHours(10),
                                DEFAULT_ZONED_TIME.plusHours(11)))
        );

        Map<String, Set<String>> expected = Map.of(
                "comp1", Set.of("symptom1", "symptom2"),
                "comp2", Set.of("symptom1", "symptom2")
        );

        Map<String, Set<String>> result = underTest
                .findPotentialSymptomsByFoodComponents(analyzableInformation, 11);

        assert result.equals(expected);
    }

    @Test
    void findPotentialSymptomsByFoodComponents_componentHaveNotSymptomAnotherDay_thenFoodComponentHaveNotSymptoms() {
        AnalyzableInformation analyzableInformation = new AnalyzableInformation(
                List.of(new FoodComponentDate("comp1", DEFAULT_ZONED_TIME),
                        new FoodComponentDate("comp2", DEFAULT_ZONED_TIME),
                        new FoodComponentDate("comp1", DEFAULT_ZONED_TIME.plusHours(15))),
                List.of(new SymptomDate("symptom1",
                        DEFAULT_ZONED_TIME.plusHours(10),
                        DEFAULT_ZONED_TIME.plusHours(11)))
        );

        Map<String, Set<String>> expected = Map.of(
                "comp1", Set.of(),
                "comp2", Set.of("symptom1")
        );

        Map<String, Set<String>> result = underTest
                .findPotentialSymptomsByFoodComponents(analyzableInformation, 11);

        assert result.equals(expected);
    }

    @Test
    void findPotentialSymptomsByFoodComponents_givenTwoSymptomsInSymptomTime_thenFoodComponentHaveTwoSymptoms() {
        AnalyzableInformation analyzableInformation = new AnalyzableInformation(
                List.of(new FoodComponentDate("comp1", DEFAULT_ZONED_TIME),
                        new FoodComponentDate("comp1", DEFAULT_ZONED_TIME.plusHours(15))),
                List.of(new SymptomDate("symptom1",
                                DEFAULT_ZONED_TIME.plusHours(9),
                                DEFAULT_ZONED_TIME.plusHours(11)),
                        new SymptomDate("symptom2",
                                DEFAULT_ZONED_TIME.plusHours(16),
                                DEFAULT_ZONED_TIME.plusHours(17)))
        );

        Map<String, Set<String>> expected = Map.of(
                "comp1", Set.of("symptom1", "symptom2")
        );

        Map<String, Set<String>> result = underTest
                .findPotentialSymptomsByFoodComponents(analyzableInformation, 10);

        assert result.equals(expected);
    }
}