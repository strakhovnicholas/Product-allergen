package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.dto.NoteDto;
import ru.productallergen.userservice.userInfo.entity.NoteEntity;
import ru.productallergen.userservice.userInfo.web.NoteWebDto;

import java.util.UUID;

@Component
public class NoteMapper {

    public NoteEntity toEntity(NoteDto dto, UUID userId) {
        return new NoteEntity(
                null,
                dto.getNoteId() != null ? dto.getNoteId() : UUID.randomUUID(),
                userId,
                dto.getContent(),
                dto.getDate()
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

    public NoteDto toDto(NoteWebDto webDto) {
        return NoteDto.builder()
                .noteId(webDto.getNoteId())
                .content(webDto.getContent())
                .date(webDto.getDate())
                .build();
    }

    public NoteWebDto toWebDto(NoteDto dto) {
        return NoteWebDto.builder()
                .noteId(dto.getNoteId())
                .content(dto.getContent())
                .date(dto.getDate())
                .build();
    }

}

