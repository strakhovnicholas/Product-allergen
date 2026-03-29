package ru.productallergen.userservice.food.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import ru.productallergen.userservice.userInfo.FoodCategory;

import java.time.ZonedDateTime;
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

    @NotNull
    @Column(name = "user_id", nullable = false)
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
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}