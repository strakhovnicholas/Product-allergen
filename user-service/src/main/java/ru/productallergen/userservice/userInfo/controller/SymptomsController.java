package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
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
import ru.productallergen.userservice.userInfo.mapper.SymptomsMapper;
import ru.productallergen.userservice.userInfo.service.SymptomsService;
import ru.productallergen.userservice.userInfo.web.SymptomsWebDto;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SymptomsController {

    private final SymptomsService service;
    private final SymptomsMapper mapper;

    private UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    @PostMapping("/feelings/symptoms")
    public SymptomsWebDto createSymptoms(@RequestBody SymptomsWebDto request,
                                         Authentication authentication) {
        UUID userId = getUserId(authentication);

        return mapper.toWebDto(service.createSymptoms(userId, mapper.toDto(request)));
    }

    @GetMapping("/feelings/symptoms/all")
    public List<SymptomsWebDto> getAllSymptoms(Authentication authentication) {
        UUID userId = getUserId(authentication);

        return service.getAllSymptoms(userId)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @GetMapping("/feelings/symptoms/range")
    public List<SymptomsWebDto> getSymptomsByDateRange(@RequestParam ZonedDateTime from,
                                                       @RequestParam ZonedDateTime to,
                                                       Authentication authentication) {
        UUID userId = getUserId(authentication);

        return service.getSymptomsByDateRange(userId, from, to)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @PutMapping("/feelings/symptoms")
    public SymptomsWebDto updateSymptoms(@RequestBody SymptomsWebDto request,
                                         Authentication authentication) {
        UUID userId = getUserId(authentication);

        return mapper.toWebDto(service.updateSymptoms(userId, mapper.toDto(request)));
    }

    @DeleteMapping("/feelings/symptoms/{symptomsId}")
    public void deleteSymptoms(@PathVariable UUID symptomsId,
                               Authentication authentication) {
        UUID userId = getUserId(authentication);
        service.deleteSymptoms(userId, symptomsId);
    }
}
