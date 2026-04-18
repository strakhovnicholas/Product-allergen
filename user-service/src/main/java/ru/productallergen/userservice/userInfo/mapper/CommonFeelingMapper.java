package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.CommonFeelingDto;
import ru.productallergen.userservice.userInfo.entity.CommonFeelingEntity;
import ru.productallergen.userservice.userInfo.web.CommonFeelingWebDto;

import java.util.UUID;

@Component
public class CommonFeelingMapper {

    public CommonFeelingEntity toEntity(CommonFeelingDto dto, UUID userId) {
        return new CommonFeelingEntity(
                null,
                dto.getFeelingId() != null ? dto.getFeelingId() : UUID.randomUUID(),
                userId,
                dto.getDateTime(),
                dto.getWellbeingScore()
        );
    }

    public CommonFeelingDto toDto(CommonFeelingEntity entity) {
        return CommonFeelingDto.builder()
                .feelingId(entity.feelingId())
                .userId(entity.userId())
                .dateTime(entity.dateTime())
                .wellbeingScore(entity.wellbeingScore())
                .build();
    }

    public CommonFeelingDto toDto(CommonFeelingWebDto webDto) {
        return CommonFeelingDto.builder()
                .feelingId(webDto.getFeelingId())
                .dateTime(webDto.getDateTime())
                .wellbeingScore(webDto.getWellbeingScore())
                .build();
    }

    public CommonFeelingWebDto toWebDto(CommonFeelingDto dto) {
        return CommonFeelingWebDto.builder()
                .feelingId(dto.getFeelingId())
                .dateTime(dto.getDateTime())
                .wellbeingScore(dto.getWellbeingScore())
                .build();
    }
}

