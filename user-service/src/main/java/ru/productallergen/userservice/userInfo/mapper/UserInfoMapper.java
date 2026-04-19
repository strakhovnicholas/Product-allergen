package ru.productallergen.userservice.userInfo.mapper;

import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.ChronicDisease;
import ru.productallergen.userservice.userInfo.Gender;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.entity.UserInfoEntity;
import ru.productallergen.userservice.userInfo.web.UserInfoCreateRequest;
import ru.productallergen.userservice.userInfo.web.UserInfoUpdateRequest;
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

    public UserInfoDto toDto(UserInfoCreateRequest request, UUID userId) {
        return new UserInfoDto(
                userId,
                request.fullName(),
                request.age(),
                request.weight(),
                request.height(),
                request.gender(),
                request.country(),
                request.smoker(),
                request.alcohol(),
                request.sports(),
                request.chronicDiseases(),
                request.allergies(),
                request.predisposition(),
                request.medicationsRegular(),
                request.doctorNotes(),
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    public UserInfoDto toDto(UserInfoUpdateRequest request, UUID userId) {
        return new UserInfoDto(
                userId,
                request.fullName(),
                request.age(),
                request.weight(),
                request.height(),
                request.gender(),
                request.country(),
                request.smoker(),
                request.alcohol(),
                request.sports(),
                request.chronicDiseases(),
                request.allergies(),
                request.predisposition(),
                request.medicationsRegular(),
                request.doctorNotes(),
                request.registeredAt(),
                LocalDateTime.now()
        );
    }

    public UserInfoDto toDto(UserInfoWebDto webDto) {
        return UserInfoDto.builder()
                .userId(webDto.userId())
                .fullName(webDto.fullName())
                .age(webDto.age())
                .weight(webDto.weight())
                .height(webDto.height())
                .gender(webDto.gender())
                .country(webDto.country())
                .smoker(webDto.smoker())
                .alcohol(webDto.alcohol())
                .sports(webDto.sports())
                .chronicDiseases(webDto.chronicDiseases())
                .allergies(webDto.allergies())
                .predisposition(webDto.predisposition())
                .medicationsRegular(webDto.medicationsRegular())
                .doctorNotes(webDto.doctorNotes())
                .registeredAt(webDto.registeredAt())
                .updatedAt(webDto.updatedAt())
                .build();
    }

    public UserInfoWebDto toWebDto(UserInfoDto dto) {
        return new UserInfoWebDto(
                dto.getUserId(),
                dto.getFullName(),
                dto.getAge(),
                dto.getWeight(),
                dto.getHeight(),
                dto.getGender(),
                dto.getCountry(),
                dto.getSmoker(),
                dto.getAlcohol(),
                dto.getSports(),
                dto.getChronicDiseases(),
                dto.getAllergies(),
                dto.getPredisposition(),
                dto.getMedicationsRegular(),
                dto.getDoctorNotes(),
                dto.getRegisteredAt(),
                dto.getUpdatedAt()
        );
    }
}