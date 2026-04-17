package ru.productallergen.userservice.medicines.service;

import ru.productallergen.userservice.medicines.dto.IntakeMedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineEditRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineResponseDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface IntakeMedicineService {
    List<IntakeMedicineResponseDto> getIntakeByPeriod(UUID userId, LocalDateTime from, LocalDateTime to);

    IntakeMedicineResponseDto save(IntakeMedicineCreateRequestDto dto, UUID userId);

    IntakeMedicineResponseDto update(Long id, IntakeMedicineEditRequestDto dto, UUID userId);

    void delete(Long id, UUID userId);
}