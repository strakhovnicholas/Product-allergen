package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "common_feelings")
public record CommonFeelingEntity(@Id ObjectId id,
                                  @Field(targetType = FieldType.STRING)
                                  UUID feelingId,
                                  @Field(targetType = FieldType.STRING)
                                  UUID userId,
                                  LocalDateTime dateTime,
                                  Integer wellbeingScore,
                                  Integer mood,
                                  Integer energyLevel,
                                  String comment) {
}
