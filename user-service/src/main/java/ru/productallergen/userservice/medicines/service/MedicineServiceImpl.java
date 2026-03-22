package ru.productallergen.userservice.medicines.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.userservice.exception.NotFoundException;
import ru.productallergen.userservice.exception.UserHasNotAccess;
import ru.productallergen.userservice.medicines.dto.MedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineEditRequestDto;
import ru.productallergen.userservice.medicines.entity.MedicineEntity;
import ru.productallergen.userservice.medicines.repository.MedicineRepository;
import ru.productallergen.userservice.medicines.dto.MedicineResponseDto;
import ru.productallergen.userservice.medicines.mapper.MedicineMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicineServiceImpl implements MedicineService {
    private final MedicineMapper medicineMapper;
    private final MedicineRepository medicineRepository;

    private static final String MEDICINE_NOT_FOUND_KEY = "medicine.not.found";
    private static final String USER_HAS_NO_ACCESS_KEY = "user.has.no.medicine";

    @Override
    public List<MedicineResponseDto> getAllUserMedicines(UUID userId) {
        return medicineMapper.toDtoList(medicineRepository.findAllByUserId(userId));
    }

    @Override
    @Transactional
    public MedicineResponseDto save(MedicineCreateRequestDto medicineCreateRequestDto, UUID userId) {
        MedicineEntity entityToSave = medicineMapper.toEntity(medicineCreateRequestDto, userId);
        MedicineEntity savedEntity = medicineRepository.save(entityToSave);
        return medicineMapper.toResponseDto(savedEntity);
    }

    @Override
    @Transactional
    public MedicineResponseDto update(Long id, MedicineEditRequestDto dto, UUID userId) {
        MedicineEntity existingEntity = medicineRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MEDICINE_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        medicineMapper.updateEntityFromDto(dto, existingEntity);
        MedicineEntity updatedEntity = medicineRepository.save(existingEntity);

        return medicineMapper.toResponseDto(updatedEntity);
    }

    @Override
    @Transactional
    public void delete(Long id, UUID userId) {
        MedicineEntity existingEntity = medicineRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MEDICINE_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        medicineRepository.deleteById(id);
    }

    private void throwIfUserHasNotAccess(MedicineEntity existingEntity, UUID userId) {
        if (!existingEntity.getUserId().equals(userId)) {
            throw new UserHasNotAccess(USER_HAS_NO_ACCESS_KEY);
        }
    }
}