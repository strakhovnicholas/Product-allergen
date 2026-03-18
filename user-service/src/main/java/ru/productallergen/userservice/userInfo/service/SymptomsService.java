package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.SymptomsRepository;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;
import ru.productallergen.userservice.userInfo.mapper.SymptomsMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SymptomsService {

    private final SymptomsRepository repository;
    private final SymptomsMapper mapper;

    public SymptomsDto create(UUID userId, SymptomsDto dto) {
        SymptomsDto withUser = SymptomsDto.builder()
                .symptomsId(dto.getSymptomsId())
                .userId(userId)
                .symptomName(dto.getSymptomName())
                .severity(dto.getSeverity())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .possibleCause(dto.getPossibleCause())
                .build();

        SymptomsEntity entity = mapper.toEntity(withUser, new ObjectId());
        return mapper.toDto(repository.save(entity));
    }

    public List<SymptomsDto> getAllByUser(UUID userId) {
        return repository.findAllByUserId(userId).stream()
                .map(mapper::toDto)
                .toList();
    }
}
