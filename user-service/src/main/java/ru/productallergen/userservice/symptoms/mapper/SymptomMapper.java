package ru.productallergen.userservice.symptoms.mapper;

import org.mapstruct.*;
import ru.productallergen.userservice.symptoms.dto.SymptomCreateRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomEditRequestDto;
import ru.productallergen.userservice.symptoms.dto.SymptomResponseDto;
import ru.productallergen.userservice.symptoms.entity.SymptomEntity;

import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SymptomMapper {

    SymptomEntity toEntity(SymptomCreateRequestDto dto, UUID userId);

    SymptomResponseDto toResponseDto(SymptomEntity entity);

    List<SymptomResponseDto> toDtoList(List<SymptomEntity> entities);

    void updateEntityFromDto(SymptomEditRequestDto dto, @MappingTarget SymptomEntity entity);
}