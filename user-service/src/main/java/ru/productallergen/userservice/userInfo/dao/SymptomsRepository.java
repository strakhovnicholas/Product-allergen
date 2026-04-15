package ru.productallergen.userservice.userInfo.dao;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface SymptomsRepository extends MongoRepository<SymptomsEntity, ObjectId> {
    List<SymptomsEntity> findAllByUserId(UUID userId);

    List<SymptomsEntity> findAllByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
            UUID userId,
            LocalDateTime from,
            LocalDateTime to
    );

    void deleteByUserIdAndId(UUID userId, UUID symptomsId);

    @Query(value = "{ 'userId': ?0, '_id': ?1 }", delete = true)
    void deleteSymptomsId(UUID userId, UUID symptomsId);
}
