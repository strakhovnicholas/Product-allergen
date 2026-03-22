package ru.productallergen.userservice.symptoms;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    // TODO: 21.03.2026 Удалить после подключения микросервиса аутентификации
    private static final UUID MOCK_USER_ID = new UUID(0, 1);

    @Operation(summary = "Получить список всех симптомов",
            description = "Возвращает полный список сохранённых симптомов для текущего пользователя")
    @GetMapping
    public ResponseEntity<List<SymptomResponseDto>> getAllSymptoms() {
        return ResponseEntity.ok(symptomService.getAllUserSymptoms(getUserId()));
    }

    @Operation(summary = "Сохранить новый симптом", description = "Добавляет запись о симптоме в систему")
    @PostMapping
    public ResponseEntity<SymptomResponseDto> saveSymptom(
            @Parameter(description = "Данные для создания записи о симптоме", required = true)
            @RequestBody @Valid SymptomCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(symptomService.save(dto, getUserId()));
    }

    @Operation(summary = "Обновить существующий симптом",
            description = "Частичное или полное обновление записи по ID. Поля, не указанные в запросе, " +
                    "остаются без изменений.")
    @PutMapping("/{id}")
    public ResponseEntity<SymptomResponseDto> updateSymptom(
            @Parameter(description = "ID симптома для обновления", required = true)
            @PathVariable Long id,
            @Parameter(description = "Обновлённые данные симптома", required = true)
            @RequestBody @Valid SymptomEditRequestDto dto) {
        SymptomResponseDto updatedDto = symptomService.update(id, dto, getUserId());
        return ResponseEntity.ok(updatedDto);
    }

    @Operation(summary = "Удалить симптом", description = "Безвозвратно удаляет запись о симптоме по ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSymptom(
            @Parameter(description = "ID симптома для удаления", required = true)
            @PathVariable Long id) {
        symptomService.delete(id, getUserId());
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId() {
        return MOCK_USER_ID;
    }
}