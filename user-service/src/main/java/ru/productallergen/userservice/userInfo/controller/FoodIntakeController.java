package ru.productallergen.userservice.userInfo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.userInfo.mapper.FoodIntakeMapper;
import ru.productallergen.userservice.userInfo.service.FoodIntakeService;
import ru.productallergen.userservice.userInfo.web.FoodIntakeCreateRequest;
import ru.productallergen.userservice.userInfo.web.FoodIntakeUpdateRequest;
import ru.productallergen.userservice.userInfo.web.FoodIntakeWebDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Управление приёмами пищи", description = "API для управления записями о приёмах пищи пользователя")
public class FoodIntakeController {
    private final FoodIntakeService service;
    private final FoodIntakeMapper mapper;

    @Operation(summary = "Создать запись о приёме пищи",
            description = "Добавляет новую запись о приёме пищи в систему")
    @PostMapping("/feelings/food")
    public ResponseEntity<FoodIntakeWebDto> create(@Parameter(description = "Данные для создания записи о приёме пищи", required = true)
                                                   @RequestBody FoodIntakeCreateRequest request,
                                                   @CurrentUserId UUID userId) {
        FoodIntakeWebDto response = mapper.toWebDto(service.createFoodIntake(mapper.toDto(request, userId)));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить все записи о приёмах пищи",
            description = "Возвращает полный список записей о приёмах пищи для текущего пользователя")
    @GetMapping("/feelings/food")
    public ResponseEntity<List<FoodIntakeWebDto>> getAll(@CurrentUserId UUID userId) {
        List<FoodIntakeWebDto> response = service.getAllFoodsIntake(userId)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получить записи о приёмах пищи по дате",
            description = "Возвращает список записей о приёмах пищи за указанную дату")
    @GetMapping("/feelings/food/by-date")
    public ResponseEntity<List<FoodIntakeWebDto>> getByDate(@Parameter(description = "Дата в формате ISO (YYYY-MM-DD) для фильтрации записей", required = true)
                                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                            @CurrentUserId UUID userId) {
        List<FoodIntakeWebDto> response = service.getFoodIntakeByDate(userId, date)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить запись о приёме пищи",
            description = "Полное обновление записи по ID. Поля, не указанные в запросе, не обновляются")
    @PutMapping("/feelings/food/{foodIntakeId}")
    public ResponseEntity<FoodIntakeWebDto> update(@Parameter(description = "ID записи о приёме пищи для обновления", required = true)
                                                   @PathVariable UUID foodIntakeId,
                                                   @Parameter(description = "Обновленные данные записи о приёме пищи", required = true)
                                                   @RequestBody FoodIntakeUpdateRequest request,
                                                   @CurrentUserId UUID userId) {
        FoodIntakeWebDto response = mapper.toWebDto(service.updateFoodIntake(mapper.toDto(request, foodIntakeId, userId)));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Удалить запись о приёме пищи",
            description = "Безвозвратно удаляет запись о приёме пищи по ID")
    @DeleteMapping("/feelings/food/{foodIntakeId}")
    public ResponseEntity<Void> delete(@Parameter(description = "ID записи о приёме пищи для удаления", required = true)
                                       @PathVariable UUID foodIntakeId,
                                       @CurrentUserId UUID userId) {
        service.deleteFoodIntake(userId, foodIntakeId);
        return ResponseEntity.noContent().build();
    }
}