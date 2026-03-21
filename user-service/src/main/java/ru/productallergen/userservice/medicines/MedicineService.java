package ru.productallergen.userservice.medicines;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {
    private final MedicineMapper medicineMapper;
    private final MedicineRepository medicineRepository;

    public List<MedicineResponseDto> getAllMedicines() {
        return medicineMapper.toDtoList(medicineRepository.findAll());
    }

    public void save(MedicineRequestDto medicineRequestDto) {
        medicineRepository.save(medicineMapper.toEntity(medicineRequestDto));
    }
}