package ru.productallergen.userservice.medicines.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "intake_medicine", indexes = {
        @Index(name = "idx_intake_user_id", columnList = "user_id"),
        @Index(name = "idx_intake_date", columnList = "intake_date"),
        @Index(name = "idx_intake_user_date", columnList = "user_id, intake_date")
})
@Getter
@Setter
public class IntakeMedicineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotBlank(message = "Medicine name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    @NotNull(message = "Dosage is required")
    @Min(value = 0, message = "Dosage must be positive")
    @Column(name = "dosage", nullable = false)
    private Integer dosage;

    @NotNull(message = "Unit is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "unit", nullable = false, length = 20)
    private Unit unit;

    @NotNull(message = "Intake date is required")
    @Column(name = "intake_date", nullable = false)
    private LocalDateTime intakeDate;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}