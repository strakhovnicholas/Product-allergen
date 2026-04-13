package ru.productallergen.userservice.userInfo.web;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FoodIntakeWebDto {
    private UUID foodIntakeId;
    private String foodName;
    private FoodCategory category;
    private Double amount;
    private FoodUnit unit;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ", timezone = "UTC")
    private LocalDateTime intakeTime;
    private Boolean reactionOccurred;
    private String reactionDescription;
    private LocalDateTime createdAt;
    private List<String> components;
}