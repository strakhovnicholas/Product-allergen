package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.FoodIntakeRepository;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.entity.FoodIntakeEntity;
import ru.productallergen.userservice.userInfo.mapper.FoodIntakeMapper;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FoodIntakeService {

    private final FoodIntakeRepository repository;
    private final FoodIntakeMapper mapper;

    public FoodIntakeDto create(UUID userId, FoodIntakeDto dto) {
        FoodIntakeDto withUser = FoodIntakeDto.builder()
                .foodIntakeId(dto.getFoodIntakeId())
                .userId(userId)
                .foodName(dto.getFoodName())
                .category(dto.getCategory())
                .amount(dto.getAmount())
                .unit(dto.getUnit())
                .intakeTime(dto.getIntakeTime())
                .reactionOccurred(dto.getReactionOccurred())
                .reactionDescription(dto.getReactionDescription())
                .createdAt(ZonedDateTime.now())
                .build();
        FoodIntakeEntity entity = mapper.toEntity(withUser, new ObjectId());
        return mapper.toDto(repository.save(entity));
    }

    public List<FoodIntakeDto> getAllByUser(UUID userId) {
        return repository.findAllByUserId(userId).stream()
                .map(mapper::toDto)
                .toList();
    }

    public void delete(UUID foodIntakeId) {
        repository.findAll().stream()
                .filter(e -> foodIntakeId.equals(e.foodIntakeId()))
                .findFirst()
                .ifPresent(repository::delete);
    }
}
