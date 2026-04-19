package ru.productallergen.userservice.userInfo.web;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;


@Schema(description = "DTO для передачи данных о самочувствии")
public record CommonFeelingWebDto(
        @NotNull
        @Schema(description = "Уникальный идентификатор записи о самочувствии")
        UUID feelingId,

        @Schema(description = "Дата и время фиксации самочувствия")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime dateTime,

        @Schema(description = "Оценка самочувствия (1-10)")
        Integer wellbeingScore
) {
}