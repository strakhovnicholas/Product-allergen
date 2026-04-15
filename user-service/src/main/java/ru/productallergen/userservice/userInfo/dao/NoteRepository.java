package ru.productallergen.userservice.userInfo.dao;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import ru.productallergen.userservice.userInfo.entity.NoteEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NoteRepository extends MongoRepository<NoteEntity, ObjectId> {

    List<NoteEntity> findAllByUserId(UUID userId);

    List<NoteEntity> findAllByUserIdAndDateBetween(UUID userId, LocalDateTime from, LocalDateTime to);

    Optional<NoteEntity> findByUserIdAndNoteId(UUID userId, UUID noteId);

    void deleteByUserIdAndNoteId(UUID userId, UUID noteId);
}
