package ru.productallergen.userservice.foodanalyzer;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentSymptomsAnalyzeRequest;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentSymptomsResponse;
import ru.productallergen.userservice.foodanalyzer.service.FoodAnalyzerServiceFacade;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/food-analyzer")
@RequiredArgsConstructor
@Tag(name = "Анализатор компонентов еды и симптомов",
        description = "API для анализа компонентов еды и симптомов")
public class FoodAnalyzerController {
    private final FoodAnalyzerServiceFacade foodAnalyzerServiceFacade;

    @Operation(summary = "Получить список компонентов еды и вызываемых от них симптомов",
            description = "Возвращает список компонентов еды и потенциально возникших от них симптомов за период времени." +
                    " Компонент считается безопасным, после его принятия в течение 'безопасного' времени не возникало" +
                    " никаких симптомов")
    @PostMapping("/analyze")
    public ResponseEntity<List<FoodComponentSymptomsResponse>> analyzeFoodAndSymptoms(
            @CurrentUserId UUID userId,
            @RequestBody @Valid FoodComponentSymptomsAnalyzeRequest request) {
        return ResponseEntity.ok(foodAnalyzerServiceFacade.analyzeFoodAndSymptoms(userId, request.from(), request.to()));
    }
}
