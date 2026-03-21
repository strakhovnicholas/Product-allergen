package ru.productallergen.userservice.userInfo.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CommonFeelingDto {
    private UUID feelingId;
    private UUID userId;
    private ZonedDateTime dateTime;
    private Integer wellbeingScore;
    private Integer mood;
    private Integer energyLevel;
    private String comment;
}
