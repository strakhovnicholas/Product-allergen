package ru.productallergen.userservice.userInfo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.userInfo.mapper.SymptomsMapper;
import ru.productallergen.userservice.userInfo.service.SymptomsService;
import ru.productallergen.userservice.userInfo.web.SymptomsWebDto;

import java.time.ZonedDateTime;
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
    public ResponseEntity<SymptomsWebDto> createSymptoms(@Parameter(description = "Данные для создания записи о симптомах", required = true)
                                                         @RequestBody SymptomsWebDto request,
                                                         @CurrentUserId UUID userId) {
        SymptomsWebDto response = mapper.toWebDto(service.createSymptoms(userId, mapper.toDto(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить все записи о симптомах",
            description = "Возвращает полный список записей о симптомах для текущего пользователя")
    @GetMapping("/feelings/symptoms/all")
    public ResponseEntity<List<SymptomsWebDto>> getAllSymptoms(@CurrentUserId UUID userId) {
        List<SymptomsWebDto> response = service.getAllSymptoms(userId)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получить записи о симптомах по диапазону дат",
            description = "Возвращает список записей о симптомах за указанный период времени")
    @GetMapping("/feelings/symptoms/range")
    public ResponseEntity<List<SymptomsWebDto>> getSymptomsByDateRange(@Parameter(description = "Начальная дата и время диапазона (ISO-8601)", required = true)
                                                                       @RequestParam ZonedDateTime from,
                                                                       @Parameter(description = "Конечная дата и время диапазона (ISO-8601)", required = true)
                                                                       @RequestParam ZonedDateTime to,
                                                                       @CurrentUserId UUID userId) {
        List<SymptomsWebDto> response = service.getSymptomsByDateRange(userId, from, to)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить запись о симптомах",
            description = "Обновление существующей записи о симптомах")
    @PutMapping("/feelings/symptoms")
    public ResponseEntity<SymptomsWebDto> updateSymptoms(@Parameter(description = "Обновленные данные записи о симптомах", required = true)
                                                         @RequestBody SymptomsWebDto request,
                                                         @CurrentUserId UUID userId) {
        SymptomsWebDto response = mapper.toWebDto(service.updateSymptoms(userId, mapper.toDto(request)));
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