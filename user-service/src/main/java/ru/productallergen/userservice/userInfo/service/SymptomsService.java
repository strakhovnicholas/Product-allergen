package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.SymptomsRepository;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;
import ru.productallergen.userservice.userInfo.mapper.SymptomsMapper;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SymptomsService {

    private final SymptomsRepository repository;
    private final SymptomsMapper mapper;

    public SymptomsDto createSymptoms(UUID userId, SymptomsDto dto) {
        SymptomsEntity entity = mapper.toEntity(dto, userId);
        return mapper.toDto(repository.save(entity));
    }

    public List<SymptomsDto> getAllSymptoms(UUID userId) {
        return repository.findAllByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<SymptomsDto> getSymptomsByDateRange(UUID userId, ZonedDateTime from, ZonedDateTime to) {
        return repository.findAllByUserIdAndStartTimeBetweenOrderByStartTimeAsc(userId, from, to)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public SymptomsDto updateSymptoms(UUID userId, SymptomsDto dto) {
        SymptomsEntity entity = repository.findAllByUserId(userId).stream()
                .filter(e -> e.symptomsId().equals(dto.getSymptomsId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Not found"));

        SymptomsEntity updated = new SymptomsEntity(
                entity.id(),
                entity.symptomsId(),
                entity.userId(),
                dto.getSymptomName(),
                dto.getSeverity(),
                dto.getStartTime(),
                dto.getEndTime(),
                dto.getPossibleCause()
        );

        return mapper.toDto(repository.save(updated));
    }

    public void deleteSymptoms(UUID userId, UUID symptomsId) {
        repository.deleteSymptomsId(userId, symptomsId);
    }
}
