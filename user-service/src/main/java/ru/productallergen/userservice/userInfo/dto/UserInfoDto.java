package ru.productallergen.userservice.userInfo.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import ru.productallergen.userservice.userInfo.ChronicDisease;
import ru.productallergen.userservice.userInfo.Gender;
import ru.productallergen.userservice.userInfo.Predisposition;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class UserInfoDto {
    private UUID userId;
    private String fullName;
    private Integer age;
    private Double weight;
    private Integer height;
    private Gender gender;
    private String country;
    private Boolean smoker;
    private Boolean alcohol;
    private Boolean sports;
    private List<ChronicDisease> chronicDiseases;
    private List<String> allergies;
    private Predisposition predisposition;
    private List<String> medicationsRegular;
    private String doctorNotes;
    private ZonedDateTime registeredAt;
    private ZonedDateTime updatedAt;
}
