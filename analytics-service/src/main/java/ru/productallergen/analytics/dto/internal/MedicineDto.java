package ru.productallergen.analytics.dto.internal;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicineDto {
    @JsonAlias({"id"})
    private String id;

    @JsonAlias({"name", "medicineName"})
    private String name;

    private String dosage;
    private String unit;

    private LocalDateTime intakeDate;
}
