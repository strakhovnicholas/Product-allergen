package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.dto.NoteDto;
import ru.productallergen.userservice.userInfo.service.NoteService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService service;

    @PostMapping("/feelings/notes/create")
    public NoteDto create(@RequestParam UUID userId,
                          @RequestBody NoteDto request) {
        return service.create(userId, request);
    }

    @PutMapping("/feelings/notes/{id}")
    public NoteDto update(@PathVariable("id") UUID id,
                          @RequestBody NoteDto request) {
        return service.update(id, request);
    }

    @GetMapping("/feelings/notes/{id}")
    public List<NoteDto> getAll(@PathVariable("id") UUID userId) {
        return service.getAll(userId);
    }

    @GetMapping("/feelings/notes/{date}")
    public List<NoteDto> getByDate(@RequestParam UUID userId,
                                   @PathVariable
                                   @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                   LocalDate date) {
        return service.getByDate(userId, date);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") UUID id) {
        service.delete(id);
    }
}

