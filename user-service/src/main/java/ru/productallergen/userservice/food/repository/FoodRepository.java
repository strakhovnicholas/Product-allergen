package ru.productallergen.userservice.food.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.productallergen.userservice.food.entity.FoodEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface FoodRepository extends JpaRepository<FoodEntity, Long> {
    List<FoodEntity> findAllByUserId(UUID userId);

    List<FoodEntity> findByUserIdAndFoodNameStartingWithIgnoreCase(UUID userId, String prefix);
}