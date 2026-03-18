package ru.productallergen.userservice.userInfo.mapper;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.CommonFeelingDto;
import ru.productallergen.userservice.userInfo.entity.CommonFeelingEntity;

import java.util.UUID;

@Component
public class CommonFeelingMapper {

    public CommonFeelingDto toDto(CommonFeelingEntity entity) {
        if (entity == null) {
            return null;
        }
        return CommonFeelingDto.builder()
                .feelingId(entity.feelingId())
                .userId(entity.userId())
                .dateTime(entity.dateTime())
                .wellbeingScore(entity.wellbeingScore())
                .mood(entity.mood())
                .energyLevel(entity.energyLevel())
                .comment(entity.comment())
                .build();
    }

    public CommonFeelingEntity toEntity(CommonFeelingDto dto, ObjectId id) {
        if (dto == null) {
            return null;
        }
        UUID feelingId = dto.getFeelingId() != null ? dto.getFeelingId() : UUID.randomUUID();
        return new CommonFeelingEntity(
                id,
                feelingId,
                dto.getUserId(),
                dto.getDateTime(),
                dto.getWellbeingScore(),
                dto.getMood(),
                dto.getEnergyLevel(),
                dto.getComment()
        );
    }
}

