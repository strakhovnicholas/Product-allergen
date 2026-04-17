package ru.productallergen.userservice.medicines.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.userservice.exception.NotFoundException;
import ru.productallergen.userservice.exception.UserHasNotAccess;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineEditRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineResponseDto;
import ru.productallergen.userservice.medicines.entity.IntakeMedicineEntity;
import ru.productallergen.userservice.medicines.mapper.IntakeMedicineMapper;
import ru.productallergen.userservice.medicines.repository.IntakeMedicineRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IntakeMedicineServiceImpl implements IntakeMedicineService {
    private final IntakeMedicineMapper intakeMedicineMapper;
    private final IntakeMedicineRepository intakeMedicineRepository;

    private static final String INTAKE_NOT_FOUND_KEY = "intake.medicine.not.found";
    private static final String USER_HAS_NO_ACCESS_KEY = "user.has.no.intake";

    @Override
    public List<IntakeMedicineResponseDto> getIntakeByPeriod(UUID userId, LocalDateTime from, LocalDateTime to) {
        return intakeMedicineMapper.toDtoList(
                intakeMedicineRepository.findAllByUserIdAndIntakeDateBetween(userId, from, to)
        );
    }

    @Override
    @Transactional
    public IntakeMedicineResponseDto save(IntakeMedicineCreateRequestDto dto, UUID userId) {
        IntakeMedicineEntity entityToSave = intakeMedicineMapper.toEntity(dto, userId);
        IntakeMedicineEntity savedEntity = intakeMedicineRepository.save(entityToSave);
        return intakeMedicineMapper.toResponseDto(savedEntity);
    }

    @Override
    @Transactional
    public IntakeMedicineResponseDto update(Long id, IntakeMedicineEditRequestDto dto, UUID userId) {
        IntakeMedicineEntity existingEntity = intakeMedicineRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(INTAKE_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        intakeMedicineMapper.updateEntityFromDto(dto, existingEntity);
        IntakeMedicineEntity updatedEntity = intakeMedicineRepository.save(existingEntity);
        return intakeMedicineMapper.toResponseDto(updatedEntity);
    }

    @Override
    @Transactional
    public void delete(Long id, UUID userId) {
        IntakeMedicineEntity existingEntity = intakeMedicineRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(INTAKE_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        intakeMedicineRepository.deleteById(id);
    }

    private void throwIfUserHasNotAccess(IntakeMedicineEntity existingEntity, UUID userId) {
        if (!existingEntity.getUserId().equals(userId)) {
            throw new UserHasNotAccess(USER_HAS_NO_ACCESS_KEY);
        }
    }
}