package ru.productallergen.userservice.medicines;

import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;

@Getter
@Setter
public class MedicineResponseDto {
    private Long id;
    private String medicineName;
    private Integer dosage;
    private MedicineEntity.Unit unit;
    private ZonedDateTime intakeTime;
    private Integer medicationType;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
