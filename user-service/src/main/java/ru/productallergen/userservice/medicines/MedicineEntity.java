package ru.productallergen.userservice.medicines;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "medicine", indexes = {
        @Index(name = "idx_medicine_name", columnList = "medicine_name"),
        @Index(name = "idx_intake_time", columnList = "intake_time")
})
@Getter
@Setter
public class MedicineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Medicine name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @NotNull(message = "Dosage is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Dosage must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private Integer dosage;

    @NotNull(message = "Unit is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Unit unit;

    @NotNull(message = "Intake time is required")
    @Column(name = "intake_time", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private ZonedDateTime intakeTime;

    @NotNull(message = "Medication type is required")
    @Min(value = 1, message = "Medication type must be positive")
    @Max(value = 999, message = "Medication type must be between 1 and 999")
    @Column(name = "medication_type", nullable = false)
    private Integer medicationType;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    public enum Unit {
        MG,    // миллиграммы
        ML,    // миллилитры
        TABLET, // таблетки
        DROP   // капли
    }
}

