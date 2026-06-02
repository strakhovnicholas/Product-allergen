package ru.productallergen.userservice.userInfo.web;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SymptomCreateRequestDto(
        @NotBlank
        @Size(min = 1, max = 300)
        String symptomName,
        @NotNull
        @Min(1)
        @Max(10)
        Integer severity,
        @NotBlank
        String startTime,
        String endTime
) {
}
