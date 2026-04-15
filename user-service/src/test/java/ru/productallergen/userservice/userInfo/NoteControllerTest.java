package ru.productallergen.userservice.userInfo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import ru.productallergen.userservice.userInfo.controller.NoteController;
import ru.productallergen.userservice.userInfo.dto.NoteDto;
import ru.productallergen.userservice.userInfo.mapper.NoteMapper;
import ru.productallergen.userservice.userInfo.service.NoteService;
import ru.productallergen.userservice.userInfo.web.NoteWebDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NoteController.class)
class NoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NoteService service;

    @MockitoBean
    private NoteMapper mapper;

    private ObjectMapper objectMapper;

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID NOTE_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private NoteWebDto sampleWebDto;
    private NoteDto sampleDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleWebDto = NoteWebDto.builder()
                .noteId(NOTE_ID)
                .content("Test note content")
                .date(LocalDateTime.parse("2024-06-01T10:00:00+03:00"))
                .build();

        sampleDto = NoteDto.builder()
                .noteId(NOTE_ID)
                .userId(USER_ID)
                .content("Test note content")
                .date(LocalDateTime.parse("2024-06-01T10:00:00+03:00"))
                .build();
    }

    @Test
    @DisplayName("POST /api/feelings/notes — успешное создание заметки")
    void createNote_success() throws Exception {
        when(mapper.toDto(any(NoteWebDto.class))).thenReturn(sampleDto);
        when(service.createNode(eq(USER_ID), any(NoteDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(post("/api/feelings/notes")
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noteId").value(NOTE_ID.toString()))
                .andExpect(jsonPath("$.content").value("Test note content"));

        verify(service).createNode(eq(USER_ID), any(NoteDto.class));
    }

    @Test
    @DisplayName("POST /api/feelings/notes — 401 без аутентификации")
    void createNote_unauthorized() throws Exception {
        mockMvc.perform(post("/api/feelings/notes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/feelings/notes — возвращает список заметок пользователя")
    void getAllNotes_success() throws Exception {
        when(service.getAllNods(USER_ID)).thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/notes")
                        .with(userJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].noteId").value(NOTE_ID.toString()))
                .andExpect(jsonPath("$[0].content").value("Test note content"));

        verify(service).getAllNods(USER_ID);
    }

    @Test
    @DisplayName("GET /api/feelings/notes — пустой список, если заметок нет")
    void getAllNotes_empty() throws Exception {
        when(service.getAllNods(USER_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/feelings/notes")
                        .with(userJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/feelings/notes — 401 без аутентификации")
    void getAllNotes_unauthorized() throws Exception {
        mockMvc.perform(get("/api/feelings/notes"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/feelings/notes/date — фильтрация по дате")
    void getNoteByDate_success() throws Exception {
        LocalDate date = LocalDate.of(2024, 6, 1);

        when(service.getNodeByDate(USER_ID, date)).thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/notes/date")
                        .with(userJwt())
                        .param("date", "2024-06-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].noteId").value(NOTE_ID.toString()));

        verify(service).getNodeByDate(USER_ID, date);
    }

    @Test
    @DisplayName("GET /api/feelings/notes/date — 400 без параметра date")
    void getNoteByDate_missingParam() throws Exception {
        mockMvc.perform(get("/api/feelings/notes/date")
                        .with(userJwt()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/feelings/notes/date — 400 при некорректном формате даты")
    void getNoteByDate_invalidFormat() throws Exception {
        mockMvc.perform(get("/api/feelings/notes/date")
                        .with(userJwt())
                        .param("date", "01-06-2024"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/feelings/notes/{noteId} — успешное обновление")
    void updateNote_success() throws Exception {
        when(mapper.toDto(any(NoteWebDto.class))).thenReturn(sampleDto);
        when(service.updateNode(eq(USER_ID), eq(NOTE_ID), any(NoteDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(put("/api/feelings/notes/{noteId}", NOTE_ID)
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.noteId").value(NOTE_ID.toString()))
                .andExpect(jsonPath("$.content").value("Test note content"));

        verify(service).updateNode(eq(USER_ID), eq(NOTE_ID), any(NoteDto.class));
    }

    @Test
    @DisplayName("PUT /api/feelings/notes/{noteId} — 401 без аутентификации")
    void updateNote_unauthorized() throws Exception {
        mockMvc.perform(put("/api/feelings/notes/{noteId}", NOTE_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }


    @Test
    @DisplayName("DELETE /api/feelings/notes/{noteId} — успешное удаление")
    void deleteNote_success() throws Exception {
        doNothing().when(service).deleteNode(USER_ID, NOTE_ID);

        mockMvc.perform(delete("/api/feelings/notes/{noteId}", NOTE_ID)
                        .with(userJwt())
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(service).deleteNode(USER_ID, NOTE_ID);
    }

    @Test
    @DisplayName("DELETE /api/feelings/notes/{noteId} — 401 без аутентификации")
    void deleteNote_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/feelings/notes/{noteId}", NOTE_ID)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    private RequestPostProcessor userJwt() {
        return user(USER_ID.toString());
    }
}