package ru.productallergen.userservice.userInfo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
import ru.productallergen.userservice.userInfo.mapper.SymptomsMapper;
import ru.productallergen.userservice.userInfo.service.SymptomsService;
import ru.productallergen.userservice.userInfo.web.SymptomCreateRequestDto;
import ru.productallergen.userservice.userInfo.web.SymptomEditRequestDto;
import ru.productallergen.userservice.userInfo.web.SymptomResponseDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Управление симптомами", description = "API для управления записями о симптомах пользователя")
public class SymptomsController {

    private final SymptomsService service;
    private final SymptomsMapper mapper;

    @Operation(summary = "Создать запись о симптомах",
            description = "Добавляет новую запись о симптомах пользователя в систему")
    @PostMapping("/feelings/symptoms")
    public ResponseEntity<SymptomResponseDto> createSymptoms(@Parameter(description = "Данные для создания записи о симптомах", required = true)
                                                             @RequestBody @Valid SymptomCreateRequestDto request,
                                                             @CurrentUserId UUID userId) {
        SymptomResponseDto response = mapper.toWebDto(service.createSymptoms(userId, mapper.toDto(request, userId)));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить все записи о симптомах",
            description = "Возвращает полный список записей о симптомах для текущего пользователя")
    @GetMapping("/feelings/symptoms")
    public ResponseEntity<List<SymptomResponseDto>> getAllSymptoms(@CurrentUserId UUID userId,
                                                                   @Parameter(description = "Дата в формате ISO (YYYY-MM-DD)", required = true)
                                                                   @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        List<SymptomResponseDto> response = service.getSymptomsByDateRange(userId, from, from.plusDays(1))
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получить записи о симптомах по диапазону дат",
            description = "Возвращает список записей о симптомах за указанный период времени")
    @GetMapping("/feelings/symptoms/range")
    public ResponseEntity<List<SymptomResponseDto>> getSymptomsByDateRange(@Parameter(description = "Начальная дата и время диапазона (ISO-8601)", required = true)
                                                                           @RequestParam LocalDateTime from,
                                                                           @Parameter(description = "Конечная дата и время диапазона (ISO-8601)", required = true)
                                                                           @RequestParam LocalDateTime to,
                                                                           @CurrentUserId UUID userId) {
        List<SymptomResponseDto> response = service.getSymptomsByDateRange(userId, from, to)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить запись о симптомах",
            description = "Обновление существующей записи о симптомах")
    @PutMapping("/feelings/symptoms/{id}")
    public ResponseEntity<SymptomResponseDto> updateSymptoms(@Parameter(description = "Обновленные данные записи о симптомах", required = true)
                                                             @RequestBody @Valid SymptomEditRequestDto request,
                                                             @Parameter(description = "ID записи о симптомах для удаления", required = true)
                                                             @PathVariable UUID id,
                                                             @CurrentUserId UUID userId) {
        SymptomResponseDto response = mapper.toWebDto(service.updateSymptoms(userId, mapper.toDto(request, userId, id)));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Удалить запись о симптомах",
            description = "Безвозвратно удаляет запись о симптомах по ID")
    @DeleteMapping("/feelings/symptoms/{symptomsId}")
    public ResponseEntity<Void> deleteSymptoms(@Parameter(description = "ID записи о симптомах для удаления", required = true)
                                               @PathVariable UUID symptomsId,
                                               @CurrentUserId UUID userId) {
        service.deleteSymptoms(userId, symptomsId);
        return ResponseEntity.noContent().build();
    }
}