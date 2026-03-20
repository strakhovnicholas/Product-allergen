package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.mapper.NoteMapper;
import ru.productallergen.userservice.userInfo.service.NoteService;
import ru.productallergen.userservice.userInfo.web.NoteWebDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService service;
    private final NoteMapper mapper;

    private UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    @PostMapping("/feelings/notes")
    public NoteWebDto create(@RequestBody NoteWebDto request,
                             Authentication authentication) {
        UUID userId = getUserId(authentication);

        return mapper.toWebDto(service.create(userId, mapper.toDto(request)));
    }

    @GetMapping("/feelings/notes")
    public List<NoteWebDto> getAll(Authentication authentication) {
        UUID userId = getUserId(authentication);

        return service.getAll(userId)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @GetMapping("/feelings/notes/date")
    public List<NoteWebDto> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                      Authentication authentication) {
        UUID userId = getUserId(authentication);

        return service.getByDate(userId, date)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @PutMapping("/feelings/notes/{noteId}")
    public NoteWebDto update(@PathVariable UUID noteId,
                             @RequestBody NoteWebDto request,
                             Authentication authentication) {

        UUID userId = getUserId(authentication);

        return mapper.toWebDto(service.update(userId, noteId, mapper.toDto(request)));
    }

    @DeleteMapping("/feelings/notes/{noteId}")
    public void delete(@PathVariable UUID noteId,
                       Authentication authentication) {

        UUID userId = getUserId(authentication);
        service.delete(userId, noteId);
    }
}
