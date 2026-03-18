package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.CommonFeelingRepository;
import ru.productallergen.userservice.userInfo.dto.CommonFeelingDto;
import ru.productallergen.userservice.userInfo.entity.CommonFeelingEntity;
import ru.productallergen.userservice.userInfo.mapper.CommonFeelingMapper;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommonFeelingService {

    private final CommonFeelingRepository repository;
    private final CommonFeelingMapper mapper;

    public CommonFeelingDto create(UUID userId, CommonFeelingDto dto) {
        CommonFeelingDto withUser = CommonFeelingDto.builder()
                .feelingId(dto.getFeelingId())
                .userId(userId)
                .dateTime(dto.getDateTime())
                .wellbeingScore(dto.getWellbeingScore())
                .mood(dto.getMood())
                .energyLevel(dto.getEnergyLevel())
                .comment(dto.getComment())
                .build();

        CommonFeelingEntity entity = mapper.toEntity(withUser, new ObjectId());
        return mapper.toDto(repository.save(entity));
    }

    public List<CommonFeelingDto> getByUserAndDate(UUID userId, LocalDate date) {
        ZoneId zone = ZoneId.systemDefault();
        ZonedDateTime from = date.atStartOfDay(zone);
        ZonedDateTime to = from.plusDays(1);
        return repository.findAllByUserIdAndDateTimeBetween(userId, from, to).stream()
                .map(mapper::toDto)
                .toList();
    }

    public void delete(UUID feelingId) {
        repository.findAll().stream()
                .filter(e -> feelingId.equals(e.feelingId()))
                .findFirst()
                .ifPresent(repository::delete);
    }
}
