package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.NoteRepository;
import ru.productallergen.userservice.userInfo.dto.NoteDto;
import ru.productallergen.userservice.userInfo.entity.NoteEntity;
import ru.productallergen.userservice.userInfo.mapper.NoteMapper;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository repository;
    private final NoteMapper mapper;

    public NoteDto create(UUID userId, NoteDto dto) {
        NoteDto withUser = NoteDto.builder()
                .noteId(dto.getNoteId())
                .userId(userId)
                .content(dto.getContent())
                .date(dto.getDate())
                .build();
        NoteEntity entity = mapper.toEntity(withUser, new ObjectId());
        return mapper.toDto(repository.save(entity));
    }

    public NoteDto update(UUID id, NoteDto dto) {
        NoteEntity existing = repository.findAll().stream()
                .filter(e -> id.equals(e.noteId()))
                .findFirst()
                .orElseThrow();
        NoteEntity updated = new NoteEntity(
                existing.id(),
                existing.noteId(),
                existing.userId(),
                dto.getContent(),
                dto.getDate()
        );
        return mapper.toDto(repository.save(updated));
    }

    public List<NoteDto> getAll(UUID userId) {
        return repository.findAllByUserId(userId).stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<NoteDto> getByDate(UUID userId, LocalDate date) {
        ZoneId zone = ZoneId.systemDefault();
        ZonedDateTime from = date.atStartOfDay(zone);
        ZonedDateTime to = from.plusDays(1);
        return repository.findAllByUserIdAndDateBetween(userId, from, to).stream()
                .map(mapper::toDto)
                .toList();
    }

    public void delete(UUID noteId) {
        repository.findAll().stream()
                .filter(e -> noteId.equals(e.noteId()))
                .findFirst()
                .ifPresent(repository::delete);
    }
}

