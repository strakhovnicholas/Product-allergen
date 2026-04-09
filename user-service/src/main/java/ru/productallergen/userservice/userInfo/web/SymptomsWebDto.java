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
public class SymptomsWebDto {
    private UUID symptomsId;
    private String symptomName;
    private Integer severity;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private String possibleCause;
}