package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.UUID;

@Document(collection = "food_intakes")
public record FoodIntakeEntity(@Id ObjectId id,
                               UUID foodIntakeId,
                               UUID userId,
                               String foodName,
                               String category,
                               Double amount,
                               String unit,
                               ZonedDateTime intakeTime,
                               Boolean reactionOccurred,
                               String reactionDescription,
                               ZonedDateTime createdAt) {
}
