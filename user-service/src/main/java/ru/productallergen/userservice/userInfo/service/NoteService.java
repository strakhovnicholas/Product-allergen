package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.NoteRepository;
import ru.productallergen.userservice.userInfo.dto.NoteDto;
import ru.productallergen.userservice.userInfo.entity.NoteEntity;
import ru.productallergen.userservice.userInfo.mapper.NoteMapper;
import ru.productallergen.userservice.userInfo.web.NoteCreateRequestDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository repository;
    private final NoteMapper mapper;

    public NoteDto createNote(UUID userId, NoteCreateRequestDto dto) {
        NoteEntity entity = mapper.toDto(dto, userId);
        return mapper.toDto(repository.save(entity));
    }

    public List<NoteDto> getAllNods(UUID userId) {
        return repository.findAllByUserId(userId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public List<NoteDto> getNodeByDate(UUID userId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = start.plusDays(1);

        return repository.findAllByUserIdAndDateBetween(userId, start, end)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    public NoteDto updateNode(UUID userId, UUID noteId, NoteDto dto) {
        NoteEntity entity = repository.findByUserIdAndNoteId(userId, noteId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        NoteEntity updated = new NoteEntity(
                entity.id(),
                entity.noteId(),
                entity.userId(),
                dto.getContent(),
                dto.getDate()
        );

        return mapper.toDto(repository.save(updated));
    }

    public void deleteNode(UUID userId, UUID noteId) {
        repository.deleteByUserIdAndNoteId(userId, noteId);
    }
}
