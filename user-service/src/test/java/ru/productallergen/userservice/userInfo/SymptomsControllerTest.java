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
import ru.productallergen.userservice.userInfo.controller.SymptomsController;
import ru.productallergen.userservice.userInfo.dto.SymptomsDto;
import ru.productallergen.userservice.userInfo.mapper.SymptomsMapper;
import ru.productallergen.userservice.userInfo.service.SymptomsService;
import ru.productallergen.userservice.userInfo.web.SymptomsWebDto;

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

@WebMvcTest(SymptomsController.class)
class SymptomsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SymptomsService service;

    @MockitoBean
    private SymptomsMapper mapper;

    private ObjectMapper objectMapper;

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID SYMPTOMS_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private static final LocalDateTime START_TIME = LocalDateTime.parse("2024-06-01T08:00:00+03:00");
    private static final LocalDateTime END_TIME = LocalDateTime.parse("2024-06-01T10:00:00+03:00");

    private SymptomsWebDto sampleWebDto;
    private SymptomsDto sampleDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleWebDto = SymptomsWebDto.builder()
                .symptomsId(SYMPTOMS_ID)
                .symptomName("Headache")
                .severity(5)
                .startTime(START_TIME)
                .endTime(END_TIME)
                .possibleCause("Stress")
                .build();

        sampleDto = SymptomsDto.builder()
                .symptomsId(SYMPTOMS_ID)
                .userId(USER_ID)
                .symptomName("Headache")
                .severity(5)
                .startTime(START_TIME)
                .endTime(END_TIME)
                .possibleCause("Stress")
                .build();
    }


    @Test
    @DisplayName("POST /api/feelings/symptoms — успешное создание симптома")
    void createSymptoms_success() throws Exception {
        when(mapper.toDto(any(SymptomsWebDto.class))).thenReturn(sampleDto);
        when(service.createSymptoms(eq(USER_ID), any(SymptomsDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(post("/api/feelings/symptoms")
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symptomsId").value(SYMPTOMS_ID.toString()))
                .andExpect(jsonPath("$.symptomName").value("Headache"))
                .andExpect(jsonPath("$.severity").value(5))
                .andExpect(jsonPath("$.possibleCause").value("Stress"));

        verify(service).createSymptoms(eq(USER_ID), any(SymptomsDto.class));
    }

    @Test
    @DisplayName("POST /api/feelings/symptoms — 401 без аутентификации")
    void createSymptoms_unauthorized() throws Exception {
        mockMvc.perform(post("/api/feelings/symptoms")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/feelings/symptoms/all — возвращает список симптомов пользователя")
    void getAllSymptoms_success() throws Exception {
        when(service.getAllSymptoms(USER_ID)).thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/symptoms/all")
                        .with(userJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].symptomsId").value(SYMPTOMS_ID.toString()))
                .andExpect(jsonPath("$[0].symptomName").value("Headache"));

        verify(service).getAllSymptoms(USER_ID);
    }

    @Test
    @DisplayName("GET /api/feelings/symptoms/all — пустой список, если симптомов нет")
    void getAllSymptoms_empty() throws Exception {
        when(service.getAllSymptoms(USER_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/feelings/symptoms/all")
                        .with(userJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/feelings/symptoms/all — 401 без аутентификации")
    void getAllSymptoms_unauthorized() throws Exception {
        mockMvc.perform(get("/api/feelings/symptoms/all"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/feelings/symptoms/range — фильтрация по диапазону дат")
    void getSymptomsByDateRange_success() throws Exception {
        when(service.getSymptomsByDateRange(eq(USER_ID), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/symptoms/range")
                        .with(userJwt())
                        .param("from", "2024-06-01T08:00:00+03:00")
                        .param("to", "2024-06-01T10:00:00+03:00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].symptomsId").value(SYMPTOMS_ID.toString()));

        verify(service).getSymptomsByDateRange(eq(USER_ID), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("GET /api/feelings/symptoms/range — 400 без параметра from")
    void getSymptomsByDateRange_missingFrom() throws Exception {
        mockMvc.perform(get("/api/feelings/symptoms/range")
                        .with(userJwt())
                        .param("to", "2024-06-01T10:00:00+03:00"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/feelings/symptoms/range — 400 без параметра to")
    void getSymptomsByDateRange_missingTo() throws Exception {
        mockMvc.perform(get("/api/feelings/symptoms/range")
                        .with(userJwt())
                        .param("from", "2024-06-01T08:00:00+03:00"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/feelings/symptoms — успешное обновление симптома")
    void updateSymptoms_success() throws Exception {
        when(mapper.toDto(any(SymptomsWebDto.class))).thenReturn(sampleDto);
        when(service.updateSymptoms(eq(USER_ID), any(SymptomsDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(put("/api/feelings/symptoms")
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symptomsId").value(SYMPTOMS_ID.toString()))
                .andExpect(jsonPath("$.symptomName").value("Headache"))
                .andExpect(jsonPath("$.severity").value(5));

        verify(service).updateSymptoms(eq(USER_ID), any(SymptomsDto.class));
    }

    @Test
    @DisplayName("PUT /api/feelings/symptoms — 401 без аутентификации")
    void updateSymptoms_unauthorized() throws Exception {
        mockMvc.perform(put("/api/feelings/symptoms")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/feelings/symptoms/{symptomsId} — успешное удаление")
    void deleteSymptoms_success() throws Exception {
        doNothing().when(service).deleteSymptoms(USER_ID, SYMPTOMS_ID);

        mockMvc.perform(delete("/api/feelings/symptoms/{symptomsId}", SYMPTOMS_ID)
                        .with(userJwt())
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(service).deleteSymptoms(USER_ID, SYMPTOMS_ID);
    }

    @Test
    @DisplayName("DELETE /api/feelings/symptoms/{symptomsId} — 401 без аутентификации")
    void deleteSymptoms_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/feelings/symptoms/{symptomsId}", SYMPTOMS_ID)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    private RequestPostProcessor userJwt() {
        return user(USER_ID.toString());
    }
}