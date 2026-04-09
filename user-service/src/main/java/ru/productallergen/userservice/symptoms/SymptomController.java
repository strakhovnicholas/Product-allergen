package ru.productallergen.userservice.symptoms;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.symptoms.dto.SymptomCreateRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomEditRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomResponseDto;
import ru.productallergen.userservice.symptoms.service.SymptomService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/symptoms")
@RequiredArgsConstructor
@Tag(name = "Управление симптомами", description = "API для управления списком симптомов пользователя")
public class SymptomController {

    private final SymptomService symptomService;

    @Operation(summary = "Получить список всех симптомов")
    @GetMapping
    public ResponseEntity<List<SymptomResponseDto>> getAllSymptoms(@CurrentUserId UUID userId) {
        return ResponseEntity.ok(symptomService.getAllUserSymptoms(userId));
    }

    @Operation(summary = "Сохранить новый симптом")
    @PostMapping
    public ResponseEntity<SymptomResponseDto> saveSymptom(@RequestBody @Valid SymptomCreateRequestDto dto,
                                                          @CurrentUserId UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(symptomService.save(dto, userId));
    }

    @Operation(summary = "Обновить симптом")
    @PutMapping("/{id}")
    public ResponseEntity<SymptomResponseDto> updateSymptom(@PathVariable Long id,
                                                            @RequestBody @Valid SymptomEditRequestDto dto,
                                                            @CurrentUserId UUID userId) {
        SymptomResponseDto updated = symptomService.update(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Удалить симптом")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSymptom(@PathVariable Long id,
                                              @CurrentUserId UUID userId) {
        symptomService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}