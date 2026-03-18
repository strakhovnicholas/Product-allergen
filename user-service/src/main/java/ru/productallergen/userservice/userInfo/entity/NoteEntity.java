package ru.productallergen.userservice.userInfo.entity;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZonedDateTime;
import java.util.UUID;

@Document(collection = "notes")
public record NoteEntity(
        @Id ObjectId id,
        UUID noteId,
        UUID userId,
        String content,
        ZonedDateTime date
) {
}

