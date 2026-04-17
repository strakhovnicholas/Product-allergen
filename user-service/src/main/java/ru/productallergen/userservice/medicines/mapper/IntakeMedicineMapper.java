package ru.productallergen.userservice.medicines.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineEditRequestDto;
import ru.productallergen.userservice.medicines.dto.IntakeMedicineResponseDto;
import ru.productallergen.userservice.medicines.entity.IntakeMedicineEntity;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface IntakeMedicineMapper {

    @Mapping(target = "userId", source = "userId")
    IntakeMedicineEntity toEntity(IntakeMedicineCreateRequestDto dto, UUID userId);

    IntakeMedicineResponseDto toResponseDto(IntakeMedicineEntity entity);

    List<IntakeMedicineResponseDto> toDtoList(List<IntakeMedicineEntity> all);

    void updateEntityFromDto(IntakeMedicineEditRequestDto dto, @MappingTarget IntakeMedicineEntity entity);
}