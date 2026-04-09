package ru.productallergen.userservice.userInfo.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class NoteDto {
    private UUID noteId;
    private UUID userId;
    private String content;
    private ZonedDateTime date;
}
