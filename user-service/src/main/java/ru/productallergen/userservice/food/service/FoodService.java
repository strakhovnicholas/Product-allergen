package ru.productallergen.userservice.food.service;

import ru.productallergen.userservice.food.dto.FoodCreateRequestDto;
import ru.productallergen.userservice.food.dto.FoodEditRequestDto;
import ru.productallergen.userservice.food.dto.FoodResponseDto;

import java.util.List;
import java.util.UUID;

public interface FoodService {
    List<FoodResponseDto> getAllUserFoods(UUID userId);

    List<FoodResponseDto> searchByFoodName(UUID userId, String prefix);

    FoodResponseDto save(FoodCreateRequestDto foodCreateRequestDto, UUID userId);

    FoodResponseDto update(Long id, FoodEditRequestDto dto, UUID userId);

    void delete(Long id, UUID userId);
}