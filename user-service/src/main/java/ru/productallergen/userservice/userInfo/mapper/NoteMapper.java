package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.NoteDto;
import ru.productallergen.userservice.userInfo.entity.NoteEntity;
import ru.productallergen.userservice.userInfo.web.NoteCreateRequestDto;
import ru.productallergen.userservice.userInfo.web.NoteEditRequestDto;
import ru.productallergen.userservice.userInfo.web.NoteResponseDto;

import java.util.UUID;

@Component
public class NoteMapper {

    public NoteEntity toDto(NoteCreateRequestDto dto, UUID userId) {
        return new NoteEntity(
                null,
                UUID.randomUUID(),
                userId,
                dto.content(),
                dto.date()
        );
    }

    public NoteDto toDto(NoteEditRequestDto dto, UUID userId, UUID noteId) {
        return new NoteDto(
                noteId,
                userId,
                dto.content(),
                dto.date()
        );
    }

    public NoteDto toDto(NoteEntity entity) {
        return NoteDto.builder()
                .noteId(entity.noteId())
                .userId(entity.userId())
                .content(entity.content())
                .date(entity.date())
                .build();
    }

    public NoteResponseDto toWebDto(NoteDto dto) {
        return new NoteResponseDto(
                dto.getNoteId(),
                dto.getContent(),
                dto.getDate());
    }
}

