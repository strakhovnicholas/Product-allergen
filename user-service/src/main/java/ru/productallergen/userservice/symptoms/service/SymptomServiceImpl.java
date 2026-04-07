package ru.productallergen.userservice.symptoms.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.userservice.exception.NotFoundException;
import ru.productallergen.userservice.exception.UserHasNotAccess;
import ru.productallergen.userservice.symptoms.dto.SymptomCreateRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomEditRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomResponseDto;
import ru.productallergen.userservice.symptoms.entity.SymptomEntity;
import ru.productallergen.userservice.symptoms.mapper.SymptomMapper;
import ru.productallergen.userservice.symptoms.repository.SymptomRepository;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SymptomServiceImpl implements SymptomService {

    private final SymptomMapper symptomMapper;
    private final SymptomRepository symptomRepository;

    private static final String SYMPTOM_NOT_FOUND_KEY = "symptom.not.found";
    private static final String USER_HAS_NO_ACCESS_KEY = "user.has.no.symptom";

    @Override
    public List<SymptomResponseDto> getAllUserSymptoms(UUID userId) {
        return symptomMapper.toDtoList(symptomRepository.findAllByUserIdOrNull(userId));
    }

    @Override
    @Transactional
    public SymptomResponseDto save(SymptomCreateRequestDto dto, UUID userId) {
        SymptomEntity entityToSave = symptomMapper.toEntity(dto, userId);
        SymptomEntity savedEntity = symptomRepository.save(entityToSave);
        return symptomMapper.toResponseDto(savedEntity);
    }

    @Override
    @Transactional
    public SymptomResponseDto update(Long id, SymptomEditRequestDto dto, UUID userId) {
        SymptomEntity existingEntity = symptomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(SYMPTOM_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        symptomMapper.updateEntityFromDto(dto, existingEntity);
        SymptomEntity updatedEntity = symptomRepository.save(existingEntity);
        return symptomMapper.toResponseDto(updatedEntity);
    }

    @Override
    @Transactional
    public void delete(Long id, UUID userId) {
        SymptomEntity existingEntity = symptomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(SYMPTOM_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        symptomRepository.deleteById(id);
    }

    private void throwIfUserHasNotAccess(SymptomEntity entity, UUID userId) {
        if (!Objects.equals(entity.getUserId(), userId)) {
            throw new UserHasNotAccess(USER_HAS_NO_ACCESS_KEY);
        }
    }
}