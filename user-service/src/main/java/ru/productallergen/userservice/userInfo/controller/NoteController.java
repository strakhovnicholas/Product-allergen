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
import ru.productallergen.userservice.userInfo.mapper.NoteMapper;
import ru.productallergen.userservice.userInfo.service.NoteService;
import ru.productallergen.userservice.userInfo.web.NoteCreateRequestDto;
import ru.productallergen.userservice.userInfo.web.NoteEditRequestDto;
import ru.productallergen.userservice.userInfo.web.NoteResponseDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Управление заметками", description = "API для управления пользовательскими заметками")
public class NoteController {
    private final NoteService service;
    private final NoteMapper mapper;

    @Operation(summary = "Создать заметку",
            description = "Добавляет новую заметку пользователя в систему")
    @PostMapping("/feelings/notes")
    public ResponseEntity<NoteResponseDto> createNode(@Parameter(description = "Данные для создания заметки", required = true)
                                                      @RequestBody @Valid NoteCreateRequestDto request,
                                                      @CurrentUserId UUID userId) {

        NoteResponseDto response = mapper.toWebDto(service.createNote(userId, request));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить заметки по дате",
            description = "Возвращает список заметок пользователя за указанную дату")
    @GetMapping("/feelings/notes")
    public ResponseEntity<List<NoteResponseDto>> getNodeByDate(@Parameter(description = "Дата в формате ISO (YYYY-MM-DD) для фильтрации заметок", required = true)
                                                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                                          @CurrentUserId UUID userId) {
        List<NoteResponseDto> response = service.getNodeByDate(userId, date)
                .stream()
                .map(mapper::toWebDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить заметку",
            description = "Полное обновление заметки по ID. Поля, не указанные в запросе, не обновляются")
    @PutMapping("/feelings/notes/{noteId}")
    public ResponseEntity<NoteResponseDto> updateNode(@Parameter(description = "ID заметки для обновления", required = true)
                                                 @PathVariable UUID noteId,
                                                 @Parameter(description = "Обновленные данные заметки", required = true)
                                                 @RequestBody @Valid NoteEditRequestDto request,
                                                 @CurrentUserId UUID userId) {
        NoteResponseDto response = mapper.toWebDto(service.updateNode(userId, noteId, mapper.toDto(request, userId, noteId)));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Удалить заметку",
            description = "Безвозвратно удаляет заметку по ID")
    @DeleteMapping("/feelings/notes/{noteId}")
    public ResponseEntity<Void> deleteNode(@Parameter(description = "ID заметки для удаления", required = true)
                                           @PathVariable UUID noteId,
                                           @CurrentUserId UUID userId) {
        service.deleteNode(userId, noteId);
        return ResponseEntity.noContent().build();
    }
}