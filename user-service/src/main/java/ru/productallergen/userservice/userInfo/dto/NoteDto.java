package ru.productallergen.userservice.userInfo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class NoteDto {
    private UUID noteId;
    private UUID userId;
    private String content;
    private LocalDateTime date;
}
