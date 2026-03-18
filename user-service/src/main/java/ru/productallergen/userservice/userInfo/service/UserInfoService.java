package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.exeption.UserServiceException;
import ru.productallergen.userservice.userInfo.dao.UserInfoRepository;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.entity.UserInfoEntity;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final UserInfoRepository repository;
    private final UserInfoMapper mapper;

    public UserInfoDto create(UserInfoDto dto) {
        UserInfoEntity entity = mapper.toEntity(dto, new ObjectId());
        return mapper.toDto(repository.save(entity));
    }

    public Optional<UserInfoDto> getByUserId(UUID userId) {
        return repository.findByUserId(userId)
                .map(mapper::toDto);
    }

    public List<UserInfoDto> getAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .toList();
    }

    public UserInfoDto update(UUID userId, UserInfoDto dto) {
        Optional<UserInfoEntity> existing = repository.findByUserId(userId);
        if (existing.isEmpty()) {
            throw new UserServiceException("User not found");
        }
        ObjectId id = existing.get().id();
        UserInfoEntity updated = mapper.toEntity(dto, id);
        return mapper.toDto(repository.save(updated));
    }

    public void delete(UUID userId) {
        repository.findByUserId(userId).ifPresent(repository::delete);
    }
}