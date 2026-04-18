package ru.productallergen.userservice.userInfo.web;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommonFeelingWebDto {

    private UUID feelingId;

    private LocalDateTime dateTime;

    private Integer wellbeingScore;
}