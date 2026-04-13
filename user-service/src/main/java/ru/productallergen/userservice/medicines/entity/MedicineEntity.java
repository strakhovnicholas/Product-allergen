package ru.productallergen.userservice.medicines.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medicine", indexes = {
        @Index(name = "idx_medicine_user_id", columnList = "user_id"),
})
@Getter
@Setter
public class MedicineEntity {

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
    @Column(nullable = false)
    private Integer dosage;

    @NotNull(message = "Unit is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Unit unit;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

