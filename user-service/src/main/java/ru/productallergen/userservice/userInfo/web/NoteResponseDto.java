package ru.productallergen.userservice.userInfo.web;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.UUID;

public record NoteResponseDto(
        UUID noteId,
        String content,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime date
) {
}
