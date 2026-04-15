package ru.productallergen.userservice.symptoms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "symptom", indexes = {
        @Index(name = "idx_symptom_user_id", columnList = "user_id"),
})
@Getter
@Setter
public class SymptomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private UUID userId;

    @NotBlank(message = "Symptom name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    @Column(name = "symptom_name", nullable = false, length = 200)
    private String symptomName;

    @NotNull(message = "Severity is required")
    @Min(value = 1, message = "Severity must be at least 1")
    @Max(value = 10, message = "Severity must not exceed 10")
    @Column(nullable = false)
    private Integer severity;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}