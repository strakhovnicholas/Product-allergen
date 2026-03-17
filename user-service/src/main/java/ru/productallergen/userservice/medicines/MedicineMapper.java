package ru.productallergen.userservice.medicines;

import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MedicineMapper {
    MedicineEntity toEntity(MedicineRequestDto dto);

    MedicineResponseDto toDto(MedicineEntity entity);

    List<MedicineResponseDto> toDtoList(List<MedicineEntity> all);
}
