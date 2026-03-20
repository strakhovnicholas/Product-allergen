package ru.productallergen.userservice.userInfo.mapper;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;
import ru.productallergen.userservice.userInfo.web.SymptomsWebDto;

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
                dto.getEndTime(),
                dto.getPossibleCause()
        );
    }

    public SymptomsDto toDto(SymptomsEntity entity) {
        return SymptomsDto.builder()
                .symptomsId(entity.symptomsId())
                .userId(entity.userId())
                .symptomName(entity.symptomName())
                .severity(entity.severity())
                .startTime(entity.startTime())
                .endTime(entity.endTime())
                .possibleCause(entity.possibleCause())
                .build();
    }

    public SymptomsWebDto toWebDto(SymptomsDto dto) {
        return SymptomsWebDto.builder()
                .symptomsId(dto.getSymptomsId())
                .symptomName(dto.getSymptomName())
                .severity(dto.getSeverity())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .possibleCause(dto.getPossibleCause())
                .build();
    }

    public SymptomsDto toDto(SymptomsWebDto webDto) {
        return SymptomsDto.builder()
                .symptomsId(webDto.getSymptomsId())
                .symptomName(webDto.getSymptomName())
                .severity(webDto.getSeverity())
                .startTime(webDto.getStartTime())
                .endTime(webDto.getEndTime())
                .possibleCause(webDto.getPossibleCause())
                .build();
    }
}

