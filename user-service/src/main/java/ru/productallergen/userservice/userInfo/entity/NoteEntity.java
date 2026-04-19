package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.LocalDateTime;
import java.util.UUID;

@Document(collection = "notes")
public record NoteEntity(
        @Id ObjectId id,
        @Field(targetType = FieldType.STRING)
        UUID noteId,
        @Field(targetType = FieldType.STRING)
        UUID userId,
        String content,
        LocalDateTime date
) {
}
