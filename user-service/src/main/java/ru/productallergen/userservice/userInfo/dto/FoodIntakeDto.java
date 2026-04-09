package ru.productallergen.userservice.userInfo.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import ru.productallergen.userservice.userInfo.FoodCategory;
import ru.productallergen.userservice.userInfo.FoodUnit;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
public class FoodIntakeDto {
    private UUID foodIntakeId;
    private UUID userId;
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
