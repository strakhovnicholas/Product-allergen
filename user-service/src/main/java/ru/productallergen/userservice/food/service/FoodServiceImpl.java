package ru.productallergen.userservice.food.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.userservice.exception.NotFoundException;
import ru.productallergen.userservice.exception.UserHasNotAccess;
import ru.productallergen.userservice.food.dto.FoodCreateRequestDto;
import ru.productallergen.userservice.food.dto.FoodEditRequestDto;
import ru.productallergen.userservice.food.entity.FoodEntity;
import ru.productallergen.userservice.food.repository.FoodRepository;
import ru.productallergen.userservice.food.dto.FoodResponseDto;
import ru.productallergen.userservice.food.mapper.FoodMapper;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodMapper foodMapper;
    private final FoodRepository foodRepository;

    private static final String FOOD_NOT_FOUND_KEY = "food.not.found";
    private static final String USER_HAS_NO_ACCESS_KEY = "user.has.no.food";

    @Override
    public List<FoodResponseDto> getAllUserFoods(UUID userId) {
        return foodMapper.toDtoList(foodRepository.findAllByUserId(userId));
    }

    @Override
    public List<FoodResponseDto> searchByFoodName(UUID userId, String prefix) {
        return foodMapper.toDtoList(
                foodRepository.findByUserIdAndFoodNameStartingWithIgnoreCase(userId, prefix));
    }

    @Override
    @Transactional
    public FoodResponseDto save(FoodCreateRequestDto foodCreateRequestDto, UUID userId) {
        FoodEntity entityToSave = foodMapper.toEntity(foodCreateRequestDto, userId);
        FoodEntity savedEntity = foodRepository.save(entityToSave);
        return foodMapper.toResponseDto(savedEntity);
    }

    @Override
    @Transactional
    public FoodResponseDto update(Long id, FoodEditRequestDto dto, UUID userId) {
        FoodEntity existingEntity = foodRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(FOOD_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        foodMapper.updateEntityFromDto(dto, existingEntity);
        FoodEntity updatedEntity = foodRepository.save(existingEntity);
        return foodMapper.toResponseDto(updatedEntity);
    }

    @Override
    @Transactional
    public void delete(Long id, UUID userId) {
        FoodEntity existingEntity = foodRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(FOOD_NOT_FOUND_KEY, id));
        throwIfUserHasNotAccess(existingEntity, userId);
        foodRepository.deleteById(id);
    }

    private void throwIfUserHasNotAccess(FoodEntity existingEntity, UUID userId) {
        if (!existingEntity.getUserId().equals(userId)) {
            throw new UserHasNotAccess(USER_HAS_NO_ACCESS_KEY);
        }
    }
}