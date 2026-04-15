package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "symptoms")
public record SymptomsEntity(@Id ObjectId id,
                             @Field(targetType = FieldType.STRING)
                             UUID symptomsId,
                             @Field(targetType = FieldType.STRING)
                             UUID userId,
                             String symptomName,
                             Integer severity,
                             LocalDateTime startTime,
                             LocalDateTime endTime,
                             String possibleCause) {
}
