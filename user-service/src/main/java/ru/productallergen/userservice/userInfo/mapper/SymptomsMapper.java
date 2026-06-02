package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;
import ru.productallergen.userservice.userInfo.web.SymptomCreateRequestDto;
import ru.productallergen.userservice.userInfo.web.SymptomEditRequestDto;
import ru.productallergen.userservice.userInfo.web.SymptomResponseDto;
import ru.productallergen.userservice.util.DateTimeParseUtils;

import java.util.UUID;

@Component
public class SymptomsMapper {

    public SymptomsEntity toEntity(SymptomsDto dto, UUID userId) {
        return new SymptomsEntity(
                null,
                dto.getSymptomsId() != null ? dto.getSymptomsId() : UUID.randomUUID(),
                userId,
                dto.getSymptomName(),
                dto.getSeverity(),
                dto.getStartTime(),
                dto.getEndTime()
        );
    }

    public SymptomsDto toDto(SymptomCreateRequestDto requestDto, UUID userId) {
        return SymptomsDto.builder()
                .symptomsId(UUID.randomUUID())
                .userId(userId)
                .symptomName(requestDto.symptomName())
                .severity(requestDto.severity())
                .startTime(DateTimeParseUtils.parseRequired(requestDto.startTime(), "startTime"))
                .endTime(DateTimeParseUtils.parseOptional(requestDto.endTime(), "endTime"))
                .build();
    }

    public SymptomsDto toDto(SymptomEditRequestDto requestDto, UUID userId, UUID symptomId) {
        return SymptomsDto.builder()
                .symptomsId(symptomId)
                .userId(userId)
                .symptomName(requestDto.symptomName())
                .severity(requestDto.severity())
                .startTime(DateTimeParseUtils.parseRequired(requestDto.startTime(), "startTime"))
                .endTime(DateTimeParseUtils.parseOptional(requestDto.endTime(), "endTime"))
                .build();
    }

    public SymptomsDto toDto(SymptomsEntity entity) {
        return SymptomsDto.builder()
                .symptomsId(entity.symptomsId())
                .userId(entity.userId())
                .symptomName(entity.symptomName())
                .severity(entity.severity())
                .startTime(entity.startTime())
                .endTime(entity.endTime())
                .build();
    }

    public SymptomResponseDto toWebDto(SymptomsDto dto) {
        return new SymptomResponseDto(
                dto.getSymptomsId(),
                dto.getSymptomName(),
                dto.getSeverity(),
                dto.getStartTime(),
                dto.getEndTime());
    }
}

