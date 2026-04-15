package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.ChronicDisease;
import ru.productallergen.userservice.userInfo.Gender;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.entity.UserInfoEntity;
import ru.productallergen.userservice.userInfo.web.UserInfoWebDto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class UserInfoMapper {

    public UserInfoEntity toEntity(UserInfoDto dto, UUID userId) {
        return new UserInfoEntity(
                null,
                userId,
                dto.getFullName(),
                dto.getAge(),
                dto.getWeight(),
                dto.getHeight(),
                dto.getGender() != null ? dto.getGender().name() : null,
                dto.getCountry(),
                dto.getSmoker(),
                dto.getAlcohol(),
                dto.getSports(),
                dto.getChronicDiseases() != null
                        ? dto.getChronicDiseases().stream().map(Enum::name).toList()
                        : List.of(),
                dto.getAllergies(),
                dto.getPredisposition(),
                dto.getMedicationsRegular(),
                dto.getDoctorNotes(),
                dto.getRegisteredAt(),
                dto.getUpdatedAt()
        );
    }

    public UserInfoDto toDto(UserInfoEntity entity) {
        return UserInfoDto.builder()
                .userId(entity.userId())
                .fullName(entity.fullName())
                .age(entity.age())
                .weight(entity.weight())
                .height(entity.height())
                .gender(entity.gender() != null ? Gender.valueOf(entity.gender()) : null)
                .country(entity.country())
                .smoker(entity.smoker())
                .alcohol(entity.alcohol())
                .sports(entity.sports())
                .chronicDiseases(entity.chronicDiseases() != null
                        ? entity.chronicDiseases().stream().map(ChronicDisease::valueOf).toList()
                        : List.of())
                .allergies(entity.allergies())
                .predisposition(entity.predisposition())
                .medicationsRegular(entity.medicationsRegular())
                .doctorNotes(entity.doctorNotes())
                .registeredAt(entity.registeredAt())
                .updatedAt(entity.updatedAt())
                .build();
    }

    public UserInfoDto toDto(UserInfoWebDto webDto) {
        return UserInfoDto.builder()
                .userId(webDto.getUserId())
                .fullName(webDto.getFullName())
                .age(webDto.getAge())
                .weight(webDto.getWeight())
                .height(webDto.getHeight())
                .gender(webDto.getGender())
                .country(webDto.getCountry())
                .smoker(webDto.getSmoker())
                .alcohol(webDto.getAlcohol())
                .sports(webDto.getSports())
                .chronicDiseases(webDto.getChronicDiseases())
                .allergies(webDto.getAllergies())
                .predisposition(webDto.getPredisposition())
                .medicationsRegular(webDto.getMedicationsRegular())
                .doctorNotes(webDto.getDoctorNotes())
                .registeredAt(webDto.getRegisteredAt())
                .updatedAt(webDto.getUpdatedAt())
                .build();
    }

    public UserInfoWebDto toWebDto(UserInfoDto dto) {
        return UserInfoWebDto.builder()
                .userId(dto.getUserId())
                .fullName(dto.getFullName())
                .age(dto.getAge())
                .weight(dto.getWeight())
                .height(dto.getHeight())
                .gender(dto.getGender())
                .country(dto.getCountry())
                .smoker(dto.getSmoker())
                .alcohol(dto.getAlcohol())
                .sports(dto.getSports())
                .chronicDiseases(dto.getChronicDiseases())
                .allergies(dto.getAllergies())
                .predisposition(dto.getPredisposition())
                .medicationsRegular(dto.getMedicationsRegular())
                .doctorNotes(dto.getDoctorNotes())
                .registeredAt(dto.getRegisteredAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    public void updateEntity(UserInfoEntity entity, UserInfoDto dto) {
        new UserInfoEntity(
                entity.id(),
                entity.userId(),
                dto.getFullName(),
                dto.getAge(),
                dto.getWeight(),
                dto.getHeight(),
                dto.getGender() != null ? dto.getGender().name() : entity.gender(),
                dto.getCountry(),
                dto.getSmoker(),
                dto.getAlcohol(),
                dto.getSports(),
                dto.getChronicDiseases() != null
                        ? dto.getChronicDiseases().stream().map(Enum::name).toList()
                        : entity.chronicDiseases(),
                dto.getAllergies(),
                dto.getPredisposition(),
                dto.getMedicationsRegular(),
                dto.getDoctorNotes(),
                entity.registeredAt(),
                LocalDateTime.now()
        );
    }
}