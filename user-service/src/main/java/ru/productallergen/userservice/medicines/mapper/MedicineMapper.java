package ru.productallergen.userservice.medicines.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.productallergen.userservice.medicines.dto.MedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineEditRequestDto;
import ru.productallergen.userservice.medicines.entity.MedicineEntity;
import ru.productallergen.userservice.medicines.dto.MedicineResponseDto;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MedicineMapper {
    @Mapping(target = "userId", source = "userId")
    MedicineEntity toEntity(MedicineCreateRequestDto dto, UUID userId);

    MedicineResponseDto toResponseDto(MedicineEntity entity);

    List<MedicineResponseDto> toDtoList(List<MedicineEntity> all);

    /**
     * Обновляет существующую сущность данными из DTO.
     * Копируются только те поля, которые в DTO НЕ равны null.
     */
    void updateEntityFromDto(MedicineEditRequestDto dto, @MappingTarget MedicineEntity entity);
}
