package ru.productallergen.userservice.symptoms.service;

import ru.productallergen.userservice.symptoms.dto.SymptomCreateRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomEditRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomResponseDto;

import java.util.List;
import java.util.UUID;

public interface SymptomService {

    List<SymptomResponseDto> getAllUserSymptoms(UUID userId);

    SymptomResponseDto save(SymptomCreateRequestDto dto, UUID userId);

    SymptomResponseDto update(Long id, SymptomEditRequestDto dto, UUID userId);

    void delete(Long id, UUID userId);
}