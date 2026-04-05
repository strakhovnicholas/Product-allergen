package ru.productallergen.userservice.food.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.productallergen.userservice.food.entity.FoodEntity;

import java.util.List;
import java.util.UUID;

@Repository
public interface FoodRepository extends JpaRepository<FoodEntity, Long> {
    @Query("SELECT f FROM FoodEntity f WHERE " +
            "(f.userId = :userId OR f.userId IS NULL)")
    List<FoodEntity> findAllByUserIdOrNull(
            @Param("userId") UUID userId);

    @Query("SELECT f FROM FoodEntity f WHERE " +
            "(f.userId = :userId OR f.userId IS NULL) AND " +
            "LOWER(f.foodName) LIKE LOWER(CONCAT('%', :prefix, '%'))")
    List<FoodEntity> findByUserIdOrNullAndFoodNameContainingIgnoreCase(
            @Param("userId") UUID userId,
            @Param("prefix") String prefix);
}