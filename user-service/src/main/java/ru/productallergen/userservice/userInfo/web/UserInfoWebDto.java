package ru.productallergen.userservice.userInfo.web;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
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
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoWebDto {
    @Schema(description = "Id пользователя")
    private UUID userId;
    @Schema(description = "ФИО")
    private String fullName;
    @Schema(description = "Возраст")
    private Integer age;
    @Schema(description = "Вес")
    private Double weight;
    @Schema(description = "Рост")
    private Integer height;
    @Schema(description = "Пол")
    private Gender gender;
    @Schema(description = "Город")
    private String country;
    @Schema(description = "Курящий")
    private Boolean smoker;
    @Schema(description = "Употребление алкоголя")
    private Boolean alcohol;
    @Schema(description = "Наличие спорта")
    private Boolean sports;
    @Schema(description = "Хронические заболевания")
    private List<ChronicDisease> chronicDiseases;
    @Schema(description = "Аллергическая реакция")
    private List<String> allergies;
    @Schema(description = "Предрасположенность")
    private Predisposition predisposition;
    @Schema(description = "Употребляемые медикаменты")
    private List<String> medicationsRegular;
    @Schema(description = "Замечания лечащего врача")
    private String doctorNotes;
    @Schema(description = "Дата регистрации")
    private ZonedDateTime registeredAt;
    @Schema(description = "Дата обновления")
    private ZonedDateTime updatedAt;
}