package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.FoodIntakeRepository;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.entity.FoodIntakeEntity;
import ru.productallergen.userservice.userInfo.mapper.FoodIntakeMapper;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FoodIntakeService {

    private final FoodIntakeRepository repository;
    private final FoodIntakeMapper mapper;

    public FoodIntakeDto createFoodIntake(UUID userId, FoodIntakeDto dto) {
        FoodIntakeEntity entity = mapper.toEntity(dto, userId);
        return mapper.toDto(repository.save(entity));
    }

    public List<FoodIntakeDto> getAllFoodsIntake(UUID userId) {
        return repository.findAllByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<FoodIntakeDto> getFoodIntakeByDate(UUID userId, LocalDate date) {
        ZonedDateTime start = date.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime end = start.plusDays(1);

        return repository.findAllByUserIdAndIntakeTimeBetween(userId, start, end)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public FoodIntakeDto updateFoodIntake(UUID userId, UUID foodIntakeId, FoodIntakeDto dto) {
        FoodIntakeEntity entity = repository.findByUserIdAndFoodIntakeId(userId, foodIntakeId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        FoodIntakeEntity updated = new FoodIntakeEntity(
                entity.id(),
                entity.foodIntakeId(),
                entity.userId(),
                dto.getFoodName(),
                dto.getCategory() != null ? dto.getCategory().name() : entity.category(),
                dto.getAmount(),
                dto.getUnit() != null ? dto.getUnit().name() : entity.unit(),
                dto.getIntakeTime(),
                dto.getReactionOccurred(),
                dto.getReactionDescription(),
                entity.createdAt()
        );

        return mapper.toDto(repository.save(updated));
    }

    public void deleteFoodIntake(UUID userId, UUID foodIntakeId) {
        repository.deleteByUserIdAndFoodIntakeId(userId, foodIntakeId);
    }
}
