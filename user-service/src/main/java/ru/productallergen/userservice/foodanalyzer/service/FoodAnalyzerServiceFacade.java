package ru.productallergen.userservice.foodanalyzer.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.foodanalyzer.dto.AnalyzableInformation;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentSymptomsResponse;
import ru.productallergen.userservice.foodanalyzer.mapper.FoodComponentDateMapper;
import ru.productallergen.userservice.foodanalyzer.mapper.FoodComponentSymptomsResponseMapper;
import ru.productallergen.userservice.foodanalyzer.mapper.SymptomDateMapper;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.service.FoodIntakeService;
import ru.productallergen.userservice.userInfo.service.SymptomsService;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FoodAnalyzerServiceFacade {
    // TODO: вынести значение в конфиг файл
    private final int SYMPTOM_APPEARING_HOURS = 10;

    private final FoodComponentAnalyzerService foodComponentAnalyzerService;
    private final FoodComponentSymptomsResponseMapper foodComponentSymptomsResponseMapper;
    private final FoodComponentDateMapper foodComponentDateMapper;
    private final SymptomDateMapper symptomDateMapper;
    private final FoodIntakeService foodIntakeService;
    private final SymptomsService symptomsService;

    public List<FoodComponentSymptomsResponse> analyzeFoodAndSymptoms(
            UUID userId,
            ZonedDateTime from,
            ZonedDateTime to) {
        var symptomsByFoodComponents = foodComponentAnalyzerService
                .findPotentialSymptomsByFoodComponents(
                        findAnalyzableInformation(userId, from, to),
                        SYMPTOM_APPEARING_HOURS);
        return foodComponentSymptomsResponseMapper.map(symptomsByFoodComponents);
    }

    private AnalyzableInformation findAnalyzableInformation(UUID userId, ZonedDateTime from, ZonedDateTime to) {
        List<FoodIntakeDto> foodsIntakeDto = foodIntakeService.getFoodIntakeBetweenDates(userId, from, to);
        List<SymptomsDto> symptomsDto = symptomsService.getSymptomsByDateRange(userId, from, to);
        return new AnalyzableInformation(
                foodComponentDateMapper.map(foodsIntakeDto),
                symptomDateMapper.map(symptomsDto));
    }

}
