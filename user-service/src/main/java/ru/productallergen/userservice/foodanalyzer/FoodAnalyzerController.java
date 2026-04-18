package ru.productallergen.userservice.foodanalyzer;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.foodanalyzer.dto.FoodComponentSymptomsResponse;
import ru.productallergen.userservice.foodanalyzer.service.FoodAnalyzerServiceFacade;

import java.time.LocalDateTime;
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
    @GetMapping("/analyze")
    public ResponseEntity<List<FoodComponentSymptomsResponse>> analyzeFoodAndSymptoms(
            @CurrentUserId UUID userId,
            @Parameter(description = "Начало периода", required = true)
            @RequestParam LocalDateTime from,
            @Parameter(description = "Конец периода", required = true)
            @RequestParam LocalDateTime to) {
        return ResponseEntity.ok(foodAnalyzerServiceFacade.analyzeFoodAndSymptoms(userId, from, to));
    }
}
