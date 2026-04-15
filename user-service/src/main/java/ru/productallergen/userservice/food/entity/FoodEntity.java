package ru.productallergen.userservice.food.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import ru.productallergen.userservice.userInfo.FoodCategory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "food", indexes = {
        @Index(name = "idx_food_user_id", columnList = "user_id"),
        @Index(name = "idx_food_name", columnList = "food_name")
})
@Getter
@Setter
public class FoodEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private UUID userId;

    @NotBlank(message = "Food name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    @Column(name = "food_name", nullable = false, length = 200)
    private String foodName;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private FoodCategory category;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "food_components", joinColumns = @JoinColumn(name = "food_id"))
    @Column(name = "component", length = 200)
    private List<String> components = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}