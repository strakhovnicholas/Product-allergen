package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.CommonFeelingDto;
import ru.productallergen.userservice.userInfo.entity.CommonFeelingEntity;
import ru.productallergen.userservice.userInfo.web.CommonFeelingCreateRequest;
import ru.productallergen.userservice.userInfo.web.CommonFeelingUpdateRequest;
import ru.productallergen.userservice.userInfo.web.CommonFeelingWebDto;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class CommonFeelingMapper {

    public CommonFeelingEntity toEntity(CommonFeelingDto dto) {
        return new CommonFeelingEntity(
                null,
                dto.getFeelingId() != null ? dto.getFeelingId() : UUID.randomUUID(),
                dto.getUserId(),
                dto.getDateTime(),
                dto.getWellbeingScore()
        );
    }

    public CommonFeelingDto toDto(CommonFeelingUpdateRequest dto, UUID feelingId, UUID userId) {
        return CommonFeelingDto.builder()
                .userId(userId)
                .feelingId(feelingId)
                .dateTime(dto.dateTime())
                .wellbeingScore(dto.wellbeingScore())
                .build();
    }

    public CommonFeelingDto toDto(CommonFeelingCreateRequest dto, UUID userId) {
        return CommonFeelingDto.builder()
                .userId(userId)
                .feelingId(UUID.randomUUID())
                .dateTime(LocalDateTime.now())
                .wellbeingScore(dto.wellbeingScore())
                .build();
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
                .feelingId(webDto.feelingId())
                .dateTime(webDto.dateTime())
                .wellbeingScore(webDto.wellbeingScore())
                .build();
    }

    public CommonFeelingWebDto toWebDto(CommonFeelingDto dto) {
        return new CommonFeelingWebDto(
                dto.getFeelingId(),
                dto.getDateTime(),
                dto.getWellbeingScore()
        );
    }
}

