package ru.productallergen.userservice.foodanalyzer.service;

import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import ru.productallergen.userservice.foodanalyzer.dto.AnalyzableInformation;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentDate;
import ru.productallergen.userservice.foodanalyzer.dto.SymptomDate;

import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class FoodComponentAnalyzerServiceImpl implements FoodComponentAnalyzerService {
    @Override
    public Map<String, Set<String>> findPotentialSymptomsByFoodComponents(
            AnalyzableInformation analyzableInformation,
            int symptomAppearanceTimeHours) {
        Map<String, Set<String>> symptomsByFoodComponent = new HashMap<>();
        Set<String> safeFoodComponents = findSafeFoodComponents(analyzableInformation.foodComponentsDates(),
                analyzableInformation.symptomDates(),
                symptomAppearanceTimeHours);
        Iterator<FoodComponentDate> foodIterator = analyzableInformation.foodComponentsDates().iterator();
        List<SymptomDate> symptomDates = analyzableInformation.symptomDates();
        if (CollectionUtils.isEmpty(symptomDates)) {
            return getAllNonSymptomFoodComponents(analyzableInformation.foodComponentsDates());
        }
        int leftSymptomIndex = 0;
        int rightSymptomIndex = 0;
        while (foodIterator.hasNext()) {
            FoodComponentDate foodComponentDate = foodIterator.next();
            while (leftSymptomIndex < symptomDates.size()
                    && isSymptomBeforeFoodEnded(symptomDates.get(leftSymptomIndex), foodComponentDate)) {
                leftSymptomIndex++;
            }
            while (rightSymptomIndex < symptomDates.size()
                    && isSymptomStartInAppearanceTimeHours(
                    symptomDates.get(rightSymptomIndex),
                    foodComponentDate,
                    symptomAppearanceTimeHours)) {
                rightSymptomIndex++;

            }
            symptomsByFoodComponent.putIfAbsent(foodComponentDate.foodComponent(), new HashSet<>());
            if (!safeFoodComponents.contains(foodComponentDate.foodComponent())) {
                addSymptoms(symptomsByFoodComponent, foodComponentDate, symptomDates, leftSymptomIndex, rightSymptomIndex);
            }
        }
        return symptomsByFoodComponent;
    }

    private void addSymptoms(Map<String, Set<String>> symptomsByFoodComponent,
                             FoodComponentDate foodComponentDate,
                             List<SymptomDate> symptomDates,
                             int leftSymptomIndex,
                             int rightSymptomIndex) {
        Set<String> foodSymptoms = symptomsByFoodComponent.get(foodComponentDate.foodComponent());
        for (int i = leftSymptomIndex; i < rightSymptomIndex; i++) {
            foodSymptoms.add(symptomDates.get(i).symptom());
        }
    }

    private Set<String> findSafeFoodComponents(List<FoodComponentDate> foodComponentDates,
                                               List<SymptomDate> symptomDates,
                                               int symptomAppearanceTimeHours) {
        Set<String> safeFoodComponents = new HashSet<>();
        Iterator<FoodComponentDate> foodComponentDateIterator = foodComponentDates.listIterator();
        int symptomDateIndex = 0;
        while (foodComponentDateIterator.hasNext() && symptomDateIndex < symptomDates.size()) {
            FoodComponentDate foodComponentDate = foodComponentDateIterator.next();
            SymptomDate currentSymptomDate = symptomDates.get(symptomDateIndex);
            while (symptomDateIndex < symptomDates.size() && isSymptomBeforeFoodEnded(currentSymptomDate, foodComponentDate)) {
                symptomDateIndex++;
                if (symptomDateIndex < symptomDates.size()) {
                    currentSymptomDate = symptomDates.get(symptomDateIndex);
                } else {
                    currentSymptomDate = null;
                }
            }

            if (currentSymptomDate == null || isSymptomStartedAfterAppearanceTime(
                    currentSymptomDate,
                    foodComponentDate,
                    symptomAppearanceTimeHours)) {
                safeFoodComponents.add(foodComponentDate.foodComponent());
            }
        }

        while (foodComponentDateIterator.hasNext()) {
            FoodComponentDate foodComponentDate = foodComponentDateIterator.next();
            safeFoodComponents.add(foodComponentDate.foodComponent());
        }
        return safeFoodComponents;
    }


    private boolean isSymptomStartInAppearanceTimeHours(SymptomDate symptomDate,
                                                        FoodComponentDate foodComponentDate,
                                                        int symptomAppearanceHours) {
        return foodComponentDate.dateTime().plus(symptomAppearanceHours, ChronoUnit.HOURS)
                .isAfter(symptomDate.startDateTime());
    }

    private boolean isSymptomBeforeFoodEnded(SymptomDate symptomDate, FoodComponentDate foodComponentDate) {
        return symptomDate.endDateTime().isBefore(foodComponentDate.dateTime());
    }

    private Map<String, Set<String>> getAllNonSymptomFoodComponents(List<FoodComponentDate> foodComponentDates) {
        Map<String, Set<String>> allNonSymptomFoodComponents = new HashMap<>();
        for (FoodComponentDate foodComponentDate : foodComponentDates) {
            allNonSymptomFoodComponents.put(foodComponentDate.foodComponent(), Set.of());
        }
        return allNonSymptomFoodComponents;
    }

    private boolean isSymptomStartedAfterAppearanceTime(
            SymptomDate currentSymptomDate,
            FoodComponentDate foodComponentDate,
            int symptomAppearanceHours) {
        return foodComponentDate.dateTime().plus(symptomAppearanceHours, ChronoUnit.HOURS)
                .isBefore(currentSymptomDate.startDateTime());
    }
}
