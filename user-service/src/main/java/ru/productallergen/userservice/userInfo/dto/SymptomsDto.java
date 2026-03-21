package ru.productallergen.userservice.userInfo.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class SymptomsDto {
    private UUID symptomsId;
    private UUID userId;
    private String symptomName;
    private Integer severity;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private String possibleCause;
}
