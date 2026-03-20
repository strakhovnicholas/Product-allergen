package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
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

    public CommonFeelingDto createCommonFeeling(UUID userId, CommonFeelingDto dto) {
        CommonFeelingEntity entity = mapper.toEntity(dto, userId);
        return mapper.toDto(repository.save(entity));
    }

    public List<CommonFeelingDto> getAllCommonFeelings(UUID userId) {
        return repository.findAllByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<CommonFeelingDto> getCommonFeelingByDate(UUID userId, LocalDate date) {
        ZonedDateTime start = date.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime end = start.plusDays(1);

        return repository.findAllByUserIdAndDateTimeBetween(userId, start, end)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public CommonFeelingDto updateCommonFeeling(UUID userId, UUID feelingId, CommonFeelingDto dto) {
        CommonFeelingEntity entity = repository.findByUserIdAndFeelingId(userId, feelingId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        CommonFeelingEntity updated = new CommonFeelingEntity(
                entity.id(),
                entity.feelingId(),
                entity.userId(),
                dto.getDateTime(),
                dto.getWellbeingScore(),
                dto.getMood(),
                dto.getEnergyLevel(),
                dto.getComment()
        );

        return mapper.toDto(repository.save(updated));
    }

    public void deleteCommonFeeling(UUID userId, UUID feelingId) {
        repository.deleteByUserIdAndFeelingId(userId, feelingId);
    }
}
