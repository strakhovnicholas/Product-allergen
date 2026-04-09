package ru.productallergen.userservice.userInfo.web;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;

import java.time.ZonedDateTime;
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
    private ZonedDateTime intakeTime;
    private Boolean reactionOccurred;
    private String reactionDescription;
    private ZonedDateTime createdAt;
    private List<String> components;
}