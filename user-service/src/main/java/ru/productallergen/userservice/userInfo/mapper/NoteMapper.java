package ru.productallergen.userservice.userInfo.mapper;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.NoteDto;
import ru.productallergen.userservice.userInfo.entity.NoteEntity;

import java.util.UUID;

@Component
public class NoteMapper {

    public NoteDto toDto(NoteEntity entity) {
        if (entity == null) {
            return null;
        }
        return NoteDto.builder()
                .noteId(entity.noteId())
                .userId(entity.userId())
                .content(entity.content())
                .date(entity.date())
                .build();
    }

    public NoteEntity toEntity(NoteDto dto, ObjectId id) {
        if (dto == null) {
            return null;
        }
        UUID noteId = dto.getNoteId() != null ? dto.getNoteId() : UUID.randomUUID();
        return new NoteEntity(
                id,
                noteId,
                dto.getUserId(),
                dto.getContent(),
                dto.getDate()
        );
    }
}

