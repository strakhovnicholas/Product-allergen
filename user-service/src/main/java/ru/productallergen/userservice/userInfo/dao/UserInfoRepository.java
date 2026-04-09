package ru.productallergen.userservice.userInfo.dao;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import ru.productallergen.userservice.userInfo.entity.UserInfoEntity;

import java.util.Optional;
import java.util.UUID;

public interface UserInfoRepository extends MongoRepository<UserInfoEntity, ObjectId> {

    Optional<UserInfoEntity> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}