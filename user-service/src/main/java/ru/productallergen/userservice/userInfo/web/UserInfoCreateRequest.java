package ru.productallergen.userservice.userInfo.web;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import ru.productallergen.userservice.userInfo.ChronicDisease;
import ru.productallergen.userservice.userInfo.Gender;
import ru.productallergen.userservice.userInfo.Predisposition;

import java.util.List;

public record UserInfoCreateRequest(
        @Schema(description = "ФИО")
        @NotBlank(message = "ФИО не может быть пустым")
        @Size(max = 255, message = "ФИО не должно превышать 255 символов")
        String fullName,

        @Schema(description = "Возраст")
        @Min(value = 0, message = "Возраст не может быть отрицательным")
        @Max(value = 120, message = "Возраст не может превышать 150 лет")
        Integer age,

        @Schema(description = "Вес")
        @DecimalMin(value = "0.0", inclusive = false, message = "Вес должен быть больше 0")
        @DecimalMax(value = "500.0", message = "Вес не может превышать 500 кг")
        Double weight,

        @Schema(description = "Рост")
        @Min(value = 0, message = "Рост не может быть отрицательным")
        @Max(value = 300, message = "Рост не может превышать 300 см")
        Integer height,

        @Schema(description = "Пол")
        @NotNull(message = "Пол обязателен")
        Gender gender,

        @Schema(description = "Город")
        @NotBlank(message = "Город не может быть пустым")
        String country,

        @Schema(description = "Курящий")
        @NotNull(message = "Информация о курении обязательна")
        Boolean smoker,

        @Schema(description = "Употребление алкоголя")
        @NotNull(message = "Информация об употреблении алкоголя обязательна")
        Boolean alcohol,

        @Schema(description = "Наличие спорта")
        @NotNull(message = "Информация о занятиях спортом обязательна")
        Boolean sports,

        @Schema(description = "Хронические заболевания")
        List<ChronicDisease> chronicDiseases,

        @Schema(description = "Аллергическая реакция")
        List<String> allergies,

        @Schema(description = "Предрасположенность")
        @NotNull(message = "Предрасположенность обязательна")
        Predisposition predisposition,

        @Schema(description = "Употребляемые медикаменты")
        List<String> medicationsRegular,

        @Schema(description = "Замечания лечащего врача")
        @Size(max = 5000, message = "Замечания врача не должны превышать 5000 символов")
        String doctorNotes
) {
}
