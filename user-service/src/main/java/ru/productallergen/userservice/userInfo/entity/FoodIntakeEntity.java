package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Document(collection = "food_intakes")
public record FoodIntakeEntity(@Id ObjectId id,
                               @Field(targetType = FieldType.STRING)
                               UUID foodIntakeId,
                               @Field(targetType = FieldType.STRING)
                               UUID userId,
                               String foodName,
                               String category,
                               Double amount,
                               String unit,
                               LocalDateTime intakeTime,
                               Boolean reactionOccurred,
                               String reactionDescription,
                               LocalDateTime createdAt,
                               List<String> components) {
}
