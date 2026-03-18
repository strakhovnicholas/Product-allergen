package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.UUID;

@Document(collection = "symptoms")
public record SymptomsEntity(@Id ObjectId id,
                             UUID symptomsId,
                             UUID userId,
                             String symptomName,
                             Integer severity,
                             ZonedDateTime startTime,
                             ZonedDateTime endTime,
                             String possibleCause) {
}
