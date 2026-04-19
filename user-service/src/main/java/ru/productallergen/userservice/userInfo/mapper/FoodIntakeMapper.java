package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.entity.FoodIntakeEntity;
import ru.productallergen.userservice.userInfo.web.FoodIntakeCreateRequest;
import ru.productallergen.userservice.userInfo.web.FoodIntakeUpdateRequest;
import ru.productallergen.userservice.userInfo.web.FoodIntakeWebDto;

import java.time.LocalDateTime;
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
                dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now(),
                dto.getComponents()
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
                .createdAt(entity.createdAt())
                .components(entity.components())
                .build();
    }

    public FoodIntakeDto toDto(FoodIntakeUpdateRequest request, UUID foodIntakeId, UUID userId) {
        return FoodIntakeDto.builder()
                .foodIntakeId(foodIntakeId)
                .userId(userId)
                .foodName(request.foodName())
                .category(request.category())
                .amount(request.amount())
                .unit(request.unit())
                .intakeTime(request.intakeTime())
                .createdAt(request.createdAt())
                .components(request.components())
                .build();
    }

    public FoodIntakeDto toDto(FoodIntakeCreateRequest request, UUID userId) {
        return FoodIntakeDto.builder()
                .foodIntakeId(UUID.randomUUID())
                .userId(userId)
                .foodName(request.foodName())
                .category(request.category())
                .amount(request.amount())
                .unit(request.unit())
                .intakeTime(request.intakeTime())
                .createdAt(LocalDateTime.now())
                .components(request.components())
                .build();
    }

    public FoodIntakeDto toDto(FoodIntakeWebDto webDto) {
        return FoodIntakeDto.builder()
                .foodIntakeId(webDto.foodIntakeId())
                .foodName(webDto.foodName())
                .category(webDto.category())
                .amount(webDto.amount())
                .unit(webDto.unit())
                .intakeTime(webDto.intakeTime())
                .createdAt(webDto.createdAt())
                .components(webDto.components())
                .build();
    }

    public FoodIntakeWebDto toWebDto(FoodIntakeDto dto) {
        return new FoodIntakeWebDto(
                dto.getFoodIntakeId(),
                dto.getUserId(),
                dto.getFoodName(),
                dto.getCategory(),
                dto.getAmount(),
                dto.getUnit(),
                dto.getIntakeTime(),
                dto.getCreatedAt(),
                dto.getComponents()
        );
    }
}

