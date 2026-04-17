package ru.productallergen.userservice.medicines;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineEditRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineResponseDto;
import ru.productallergen.userservice.medicines.service.IntakeMedicineService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/feelings/medicines")
@RequiredArgsConstructor
@Tag(name = "Управление принятыми лекарствами", description = "API для учета приема лекарств пользователем")
public class IntakeMedicineController {
    private final IntakeMedicineService intakeMedicineService;

    @Operation(summary = "Получить список принятых лекарств за период",
            description = "Возвращает все записи о приеме лекарств за указанный период для текущего пользователя")
    @GetMapping
    public ResponseEntity<List<IntakeMedicineResponseDto>> getIntakeMedicinesByPeriod(
            @Parameter(description = "Начало периода", required = true)
            @RequestParam LocalDateTime from,
            @Parameter(description = "Конец периода", required = true)
            @RequestParam LocalDateTime to,
            @CurrentUserId UUID userId) {
        return ResponseEntity.ok(intakeMedicineService.getIntakeByPeriod(userId, from, to));
    }

    @Operation(summary = "Добавить запись о приеме лекарства",
            description = "Создает новую запись о факте приема лекарства в указанное время")
    @PostMapping
    public ResponseEntity<IntakeMedicineResponseDto> saveIntakeMedicine(
            @Parameter(description = "Данные о принятом лекарстве", required = true)
            @RequestBody @Valid IntakeMedicineCreateRequestDto dto,
            @CurrentUserId UUID userId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(intakeMedicineService.save(dto, userId));
    }

    @Operation(summary = "Обновить запись о приеме лекарства",
            description = "Частичное обновление записи о приеме по ID. Поля, не указанные в запросе, не обновляются")
    @PutMapping("/{id}")
    public ResponseEntity<IntakeMedicineResponseDto> updateIntakeMedicine(
            @Parameter(description = "ID записи о приеме", required = true)
            @PathVariable Long id,
            @Parameter(description = "Обновленные данные", required = true)
            @RequestBody @Valid IntakeMedicineEditRequestDto dto,
            @CurrentUserId UUID userId) {
        IntakeMedicineResponseDto updated = intakeMedicineService.update(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "Удалить запись о приеме лекарства",
            description = "Безвозвратно удаляет запись о приеме лекарства по ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIntakeMedicine(
            @Parameter(description = "ID записи о приеме для удаления", required = true)
            @PathVariable Long id,
            @CurrentUserId UUID userId) {
        intakeMedicineService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }
}