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
import ru.productallergen.userservice.userInfo.mapper.CommonFeelingMapper;
import ru.productallergen.userservice.userInfo.service.CommonFeelingService;
import ru.productallergen.userservice.userInfo.web.CommonFeelingWebDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Управление общим самочувствием", description = "API для управления записями о самочувствии пользователя")
public class CommonFeelingController {

    private final CommonFeelingService service;
    private final CommonFeelingMapper mapper;

    @Operation(summary = "Создать запись о самочувствии",
            description = "Добавляет новую запись об общем самочувствии пользователя в систему")
    @PostMapping("/feelings/common")
    public ResponseEntity<CommonFeelingWebDto> create(@CurrentUserId UUID userId,
                                                      @Parameter(description = "Данные для создания записи о самочувствии", required = true)
                                                      @RequestBody CommonFeelingWebDto request) {
        CommonFeelingWebDto response = mapper.toWebDto(service.createCommonFeeling(userId, mapper.toDto(request)));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить записи о самочувствии за период",
            description = "Возвращает полный список записей об общем самочувствии для текущего пользователя за период")
    @GetMapping("/feelings/common")
    public ResponseEntity<List<CommonFeelingWebDto>> getByPeriod(@CurrentUserId UUID userId,
                                                                 @Parameter(description = "Начало периода", required = true)
                                                                 @RequestParam LocalDateTime from,
                                                                 @Parameter(description = "Конец периода", required = true)
                                                                 @RequestParam LocalDateTime to) {
        List<CommonFeelingWebDto> response = service.getCommonFeelingsByPeriod(userId, from, to)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Получить запись о самочувствии по дате",
            description = "Возвращает список записей об общем самочувствии за указанную дату")
    @GetMapping("feelings/common/by-date")
    public ResponseEntity<List<CommonFeelingWebDto>> getByDate(@CurrentUserId UUID userId,
                                                               @Parameter(description = "Дата в формате ISO (YYYY-MM-DD) для фильтрации записей", required = true)
                                                               @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<CommonFeelingWebDto> response = service.getCommonFeelingByDate(userId, date)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить запись о самочувствии",
            description = "Полное обновление записи по ID. Поля, не указанные в запросе, не обновляются")
    @PutMapping("/feelings/common/{feelingId}")
    public ResponseEntity<CommonFeelingWebDto> update(@CurrentUserId UUID userId,
                                                      @Parameter(description = "ID записи о самочувствии для обновления", required = true)
                                                      @PathVariable UUID feelingId,
                                                      @Parameter(description = "Обновленные данные записи о самочувствии", required = true)
                                                      @RequestBody CommonFeelingWebDto request) {
        CommonFeelingWebDto response = mapper.toWebDto(service.updateCommonFeeling(userId, feelingId, mapper.toDto(request)));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Удалить запись о самочувствии",
            description = "Безвозвратно удаляет запись о самочувствии по ID")
    @DeleteMapping("/feelings/common/{feelingId}")
    public ResponseEntity<Void> delete(@CurrentUserId UUID userId,
                                       @Parameter(description = "ID записи о самочувствии для удаления", required = true)
                                       @PathVariable UUID feelingId) {
        service.deleteCommonFeeling(userId, feelingId);
        return ResponseEntity.noContent().build();
    }
}