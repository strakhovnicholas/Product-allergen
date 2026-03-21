package ru.productallergen.userservice.userInfo.web;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommonFeelingWebDto {

    private UUID feelingId;

    private ZonedDateTime dateTime;

    private Integer wellbeingScore;

    private Integer mood;

    private Integer energyLevel;

    private String comment;
}