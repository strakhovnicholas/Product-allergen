package ru.productallergen.userservice.userInfo.mapper;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;

import java.util.UUID;

@Component
public class SymptomsMapper {

    public SymptomsDto toDto(SymptomsEntity entity) {
        if (entity == null) {
            return null;
        }
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

    public SymptomsEntity toEntity(SymptomsDto dto, ObjectId id) {
        if (dto == null) {
            return null;
        }
        UUID symptomsId = dto.getSymptomsId() != null ? dto.getSymptomsId() : UUID.randomUUID();
        return new SymptomsEntity(
                id,
                symptomsId,
                dto.getUserId(),
                dto.getSymptomName(),
                dto.getSeverity(),
                dto.getStartTime(),
                dto.getEndTime(),
                dto.getPossibleCause()
        );
    }
}

