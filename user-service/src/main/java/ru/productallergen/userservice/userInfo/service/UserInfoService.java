package ru.productallergen.userservice.userInfo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.productallergen.userservice.userInfo.dao.UserInfoRepository;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.entity.SymptomsEntity;
import ru.productallergen.userservice.userInfo.entity.UserInfoEntity;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserInfoService {

    private final UserInfoRepository repository;
    private final UserInfoMapper mapper;

    public UserInfoDto createUserInfo(UserInfoDto dto) {
        UserInfoEntity entity = mapper.toEntity(dto, dto.getUserId());

        LocalDateTime now = LocalDateTime.now();
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

    public UserInfoDto updateUserInfo(UserInfoDto dto) {
        UserInfoEntity entity = repository.findByUserId(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("UserInfo not found"));

        UserInfoEntity updated = new UserInfoEntity(
                entity.id(),
                entity.userId(),
                dto.getFullName() != null ? dto.getFullName() : entity.fullName(),
                dto.getAge() != null ? dto.getAge() : entity.age(),
                dto.getWeight() != null ? dto.getWeight() : entity.weight(),
                dto.getHeight() != null ? dto.getHeight() : entity.height(),
                dto.getGender() != null ? dto.getGender().name() : entity.gender(),
                dto.getCountry() != null ? dto.getCountry() : entity.country(),
                dto.getSmoker() != null ? dto.getSmoker() : entity.smoker(),
                dto.getAlcohol() != null ? dto.getAlcohol() : entity.alcohol(),
                dto.getSports() != null ? dto.getSports() : entity.sports(),
                dto.getChronicDiseases() != null
                        ? dto.getChronicDiseases().stream().map(Enum::name).toList()
                        : entity.chronicDiseases(),
                dto.getAllergies() != null ? dto.getAllergies() : entity.allergies(),
                dto.getPredisposition() != null ? dto.getPredisposition() : entity.predisposition(),
                dto.getMedicationsRegular() != null ? dto.getMedicationsRegular() : entity.medicationsRegular(),
                dto.getDoctorNotes() != null ? dto.getDoctorNotes() : entity.doctorNotes(),
                entity.registeredAt(),
                LocalDateTime.now()
        );

        return mapper.toDto(repository.save(updated));
    }

    public void deleteUserInfo(UUID userId) {
        repository.deleteByUserId(userId);
    }
}