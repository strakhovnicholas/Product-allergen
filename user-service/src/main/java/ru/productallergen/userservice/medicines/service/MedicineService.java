package ru.productallergen.userservice.medicines.service;

import ru.productallergen.userservice.medicines.dto.MedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineEditRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineResponseDto;

import java.util.List;
import java.util.UUID;

public interface MedicineService {
    List<MedicineResponseDto> getAllUserMedicines(UUID userId);

    MedicineResponseDto save(MedicineCreateRequestDto medicineCreateRequestDto, UUID userId);

    MedicineResponseDto update(Long id, MedicineEditRequestDto dto, UUID userId);

    void delete(Long id, UUID userId);
}
