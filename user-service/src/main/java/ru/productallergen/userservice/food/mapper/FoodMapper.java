package ru.productallergen.userservice.food.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.productallergen.userservice.food.dto.FoodCreateRequestDto;
import ru.productallergen.userservice.food.dto.FoodEditRequestDto;
import ru.productallergen.userservice.food.entity.FoodEntity;
import ru.productallergen.userservice.food.dto.FoodResponseDto;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FoodMapper {

    @Mapping(target = "userId", source = "userId")
    FoodEntity toEntity(FoodCreateRequestDto dto, UUID userId);

    FoodResponseDto toResponseDto(FoodEntity entity);

    List<FoodResponseDto> toDtoList(List<FoodEntity> all);

    /**
     * Обновляет существующую сущность данными из DTO.
     * Копируются только те поля, которые в DTO НЕ равны null.
     */
    void updateEntityFromDto(FoodEditRequestDto dto, @MappingTarget FoodEntity entity);
}