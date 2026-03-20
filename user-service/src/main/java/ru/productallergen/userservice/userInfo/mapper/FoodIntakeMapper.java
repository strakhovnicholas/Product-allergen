package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.entity.FoodIntakeEntity;
import ru.productallergen.userservice.userInfo.web.FoodIntakeWebDto;

import java.time.ZonedDateTime;
import java.util.UUID;

@Component
public class FoodIntakeMapper {

    public FoodIntakeEntity toEntity(FoodIntakeDto dto, UUID userId) {
        return new FoodIntakeEntity(
                null,
                dto.getFoodIntakeId() != null ? dto.getFoodIntakeId() : UUID.randomUUID(),
                userId,
                dto.getFoodName(),
                dto.getCategory() != null ? dto.getCategory().name() : null,
                dto.getAmount(),
                dto.getUnit() != null ? dto.getUnit().name() : null,
                dto.getIntakeTime(),
                dto.getReactionOccurred(),
                dto.getReactionDescription(),
                dto.getCreatedAt() != null ? dto.getCreatedAt() : ZonedDateTime.now()
        );
    }

    public FoodIntakeDto toDto(FoodIntakeEntity entity) {
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

    public FoodIntakeDto toDto(FoodIntakeWebDto webDto) {
        return FoodIntakeDto.builder()
                .foodIntakeId(webDto.getFoodIntakeId())
                .foodName(webDto.getFoodName())
                .category(webDto.getCategory())
                .amount(webDto.getAmount())
                .unit(webDto.getUnit())
                .intakeTime(webDto.getIntakeTime())
                .reactionOccurred(webDto.getReactionOccurred())
                .reactionDescription(webDto.getReactionDescription())
                .createdAt(webDto.getCreatedAt())
                .build();
    }

    public FoodIntakeWebDto toWebDto(FoodIntakeDto dto) {
        return FoodIntakeWebDto.builder()
                .foodIntakeId(dto.getFoodIntakeId())
                .foodName(dto.getFoodName())
                .category(dto.getCategory())
                .amount(dto.getAmount())
                .unit(dto.getUnit())
                .intakeTime(dto.getIntakeTime())
                .reactionOccurred(dto.getReactionOccurred())
                .reactionDescription(dto.getReactionDescription())
                .createdAt(dto.getCreatedAt())
                .build();
    }

}

