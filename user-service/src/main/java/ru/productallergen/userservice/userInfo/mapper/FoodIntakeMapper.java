package ru.productallergen.userservice.userInfo.mapper;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.entity.FoodIntakeEntity;

import java.time.ZonedDateTime;
import java.util.UUID;

@Component
public class FoodIntakeMapper {

    public FoodIntakeDto toDto(FoodIntakeEntity entity) {
        if (entity == null) {
            return null;
        }
        return FoodIntakeDto.builder()
                .foodIntakeId(entity.foodIntakeId())
                .userId(entity.userId())
                .foodName(entity.foodName())
                .category(entity.category() != null ? FoodCategory.valueOf(entity.category()) : null)
                .amount(entity.amount())
                .unit(entity.unit() != null ? FoodUnit.valueOf(entity.unit()) : null)
                .intakeTime(entity.intakeTime())
                .reactionOccurred(entity.reactionOccurred())
                .reactionDescription(entity.reactionDescription())
                .createdAt(entity.createdAt())
                .build();
    }

    public FoodIntakeEntity toEntity(FoodIntakeDto dto, ObjectId id) {
        if (dto == null) {
            return null;
        }
        UUID foodIntakeId = dto.getFoodIntakeId() != null ? dto.getFoodIntakeId() : UUID.randomUUID();
        ZonedDateTime createdAt = dto.getCreatedAt() != null ? dto.getCreatedAt() : ZonedDateTime.now();
        return new FoodIntakeEntity(
                id,
                foodIntakeId,
                dto.getUserId(),
                dto.getFoodName(),
                dto.getCategory() != null ? dto.getCategory().name() : null,
                dto.getAmount(),
                dto.getUnit() != null ? dto.getUnit().name() : null,
                dto.getIntakeTime(),
                dto.getReactionOccurred(),
                dto.getReactionDescription(),
                createdAt
        );
    }
}

