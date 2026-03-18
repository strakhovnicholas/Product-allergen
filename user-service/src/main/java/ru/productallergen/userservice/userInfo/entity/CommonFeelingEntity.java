package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.UUID;
@Document(collection = "common_feelings")
public record CommonFeelingEntity(@Id ObjectId id,
                                  UUID feelingId,
                                  UUID userId,
                                  ZonedDateTime dateTime,
                                  Integer wellbeingScore,
                                  Integer mood,
                                  Integer energyLevel,
                                  String comment) {
}
