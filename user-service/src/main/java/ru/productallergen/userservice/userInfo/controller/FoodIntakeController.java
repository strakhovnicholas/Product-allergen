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
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.mapper.FoodIntakeMapper;
import ru.productallergen.userservice.userInfo.service.FoodIntakeService;
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
    public ResponseEntity<FoodIntakeWebDto> create(@Parameter(description = "Данные для создания записи", required = true)
                                                   @RequestBody FoodIntakeWebDto request,
                                                   @CurrentUserId UUID userId) {
        FoodIntakeWebDto response = mapper.toWebDto(service.createFoodIntake(userId, mapper.toDto(request)));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить все записи",
            description = "Возвращает список всех приёмов пищи пользователя")
    @GetMapping("/feelings/food")
    public ResponseEntity<List<FoodIntakeWebDto>> getAll(@CurrentUserId UUID userId) {
        List<FoodIntakeWebDto> response = service.getAllFoodsIntake(userId)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получить записи по дате",
            description = "Возвращает список приёмов пищи за указанную дату")
    @GetMapping("/feelings/food/by-date")
    public ResponseEntity<List<FoodIntakeWebDto>> getByDate(@Parameter(description = "Дата (YYYY-MM-DD)", required = true)
                                                            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                            @CurrentUserId UUID userId) {
        List<FoodIntakeWebDto> response = service.getFoodIntakeByDate(userId, date)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить запись",
            description = "Обновляет запись о приёме пищи")
    @PutMapping("/feelings/food/{foodIntakeId}")
    public ResponseEntity<FoodIntakeWebDto> update(@Parameter(description = "ID записи", required = true)
                                                   @PathVariable UUID foodIntakeId,
                                                   @RequestBody FoodIntakeWebDto request,
                                                   @CurrentUserId UUID userId) {
        FoodIntakeDto dto = mapper.toDto(request);
        FoodIntakeWebDto response = mapper.toWebDto(service.updateFoodIntake(userId, foodIntakeId, dto));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Удалить запись",
            description = "Удаляет запись о приёме пищи")
    @DeleteMapping("/feelings/food/{foodIntakeId}")
    public ResponseEntity<Void> delete(@Parameter(description = "ID записи", required = true)
                                       @PathVariable UUID foodIntakeId,
                                       @CurrentUserId UUID userId) {
        service.deleteFoodIntake(userId, foodIntakeId);
        return ResponseEntity.noContent().build();
    }
}