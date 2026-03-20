package ru.productallergen.userservice.userInfo.dao;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public interface SymptomsRepository extends MongoRepository<SymptomsEntity, ObjectId> {
    List<SymptomsEntity> findAllByUserId(UUID userId);

    List<SymptomsEntity> findAllByUserIdAndStartTimeBetween(
            UUID userId,
            ZonedDateTime from,
            ZonedDateTime to
    );

    void deleteSymptomsId(UUID userId, UUID symptomsId);
}
