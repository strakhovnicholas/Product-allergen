package ru.productallergen.userservice.userInfo.dao;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import ru.productallergen.userservice.userInfo.entity.FoodIntakeEntity;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface FoodIntakeRepository extends MongoRepository<FoodIntakeEntity, ObjectId> {

    List<FoodIntakeEntity> findAllByUserId(UUID userId);

    List<FoodIntakeEntity> findAllByUserIdAndFoodNameContainingIgnoreCase(UUID userId, String foodName);

    List<FoodIntakeEntity> findAllByUserIdAndIntakeTimeBetween(UUID userId, ZonedDateTime from, ZonedDateTime to);
}

