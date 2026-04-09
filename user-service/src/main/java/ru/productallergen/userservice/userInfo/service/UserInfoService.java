package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.UserInfoRepository;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.entity.UserInfoEntity;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final UserInfoRepository repository;
    private final UserInfoMapper mapper;

    public UserInfoDto createUserInfo(UUID userId, UserInfoDto dto) {
        UserInfoEntity entity = mapper.toEntity(dto, userId);

        ZonedDateTime now = ZonedDateTime.now();
        entity = new UserInfoEntity(
                entity.id(),
                entity.userId(),
                entity.fullName(),
                entity.age(),
                entity.weight(),
                entity.height(),
                entity.gender(),
                entity.country(),
                entity.smoker(),
                entity.alcohol(),
                entity.sports(),
                entity.chronicDiseases(),
                entity.allergies(),
                entity.predisposition(),
                entity.medicationsRegular(),
                entity.doctorNotes(),
                now,
                now
        );

        return mapper.toDto(repository.save(entity));
    }

    public UserInfoDto getUserInfo(UUID userId) {
        UserInfoEntity entity = repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("UserInfo not found"));

        return mapper.toDto(entity);
    }

    public UserInfoDto updateUserInfo(UUID userId, UserInfoDto dto) {
        UserInfoEntity entity = repository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("UserInfo not found"));

        mapper.updateEntity(entity, dto);
        return mapper.toDto(repository.save(entity));
    }

    public void deleteUserInfo(UUID userId) {
        repository.deleteByUserId(userId);
    }
}