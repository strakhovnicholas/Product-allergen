package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.service.SymptomsService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SymptomsController {

    private final SymptomsService service;

    @PostMapping("/feelings/symptoms/create")
    public SymptomsDto create(@RequestParam UUID userId,
                              @RequestBody SymptomsDto request) {
        return service.create(userId, request);
    }

    @GetMapping("/feelings/symptoms/all")
    public List<SymptomsDto> getAll(@RequestParam UUID userId) {
        return service.getAllByUser(userId);
    }
}
