package ru.productallergen.userservice.userInfo.mapper;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Component;
import ru.productallergen.userservice.userInfo.ChronicDisease;
import ru.productallergen.userservice.userInfo.Gender;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.entity.UserInfoEntity;
import ru.productallergen.userservice.userInfo.web.UserInfoWebDto;

@Component
public class UserInfoMapper {

    public UserInfoDto toDto(UserInfoEntity entity) {
        if (entity == null) return null;

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
                        ? entity.chronicDiseases().stream()
                        .map(ChronicDisease::valueOf)
                        .toList()
                        : null)
                .allergies(entity.allergies())
                .predisposition(entity.predisposition())
                .medicationsRegular(entity.medicationsRegular())
                .doctorNotes(entity.doctorNotes())
                .registeredAt(entity.registeredAt())
                .updatedAt(entity.updatedAt())
                .build();
    }

    public UserInfoEntity toEntity(UserInfoDto dto, ObjectId id) {
        if (dto == null) return null;

        return new UserInfoEntity(
                id,
                dto.getUserId(),
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
                        : null,
                dto.getAllergies(),
                dto.getPredisposition(),
                dto.getMedicationsRegular(),
                dto.getDoctorNotes(),
                dto.getRegisteredAt(),
                dto.getUpdatedAt()
        );
    }

    public UserInfoDto toDtoFromWeb(UserInfoWebDto webDto) {
        if (webDto == null) {
            return null;
        }
        return UserInfoDto.builder()
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
                .build();
    }

    public UserInfoWebDto toWebDto(UserInfoDto dto) {
        if (dto == null) {
            return null;
        }
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
}