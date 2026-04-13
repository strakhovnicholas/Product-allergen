package ru.productallergen.userservice.userInfo.dao;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import ru.productallergen.userservice.userInfo.entity.FoodIntakeEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FoodIntakeRepository extends MongoRepository<FoodIntakeEntity, ObjectId> {

    List<FoodIntakeEntity> findAllByUserId(UUID userId);

    List<FoodIntakeEntity> findAllByUserIdAndIntakeTimeBetween(
            UUID userId,
            LocalDateTime from,
            LocalDateTime to
    );

    void deleteByUserIdAndFoodIntakeId(UUID userId, UUID foodIntakeId);

    Optional<FoodIntakeEntity> findByUserIdAndFoodIntakeId(UUID userId, UUID foodIntakeId);

    List<FoodIntakeEntity> findAllByUserIdAndIntakeTimeBetweenOrderByIntakeTimeAsc(
            UUID userId,
            LocalDateTime from,
            LocalDateTime to
    );
}
