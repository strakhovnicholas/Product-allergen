package ru.productallergen.userservice.userInfo.dao;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import ru.productallergen.userservice.userInfo.entity.CommonFeelingEntity;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommonFeelingRepository extends MongoRepository<CommonFeelingEntity, ObjectId> {

    List<CommonFeelingEntity> findAllByUserId(UUID userId);

    List<CommonFeelingEntity> findAllByUserIdAndDateTimeBetween(UUID userId, ZonedDateTime from, ZonedDateTime to);

    Optional<CommonFeelingEntity> findByUserIdAndFeelingId(UUID userId, UUID feelingId);

    void deleteByUserIdAndFeelingId(UUID userId, UUID feelingId);
}
