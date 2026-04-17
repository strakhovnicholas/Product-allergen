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
import ru.productallergen.userservice.userInfo.controller.CommonFeelingController;
import ru.productallergen.userservice.userInfo.dto.CommonFeelingDto;
import ru.productallergen.userservice.userInfo.mapper.CommonFeelingMapper;
import ru.productallergen.userservice.userInfo.service.CommonFeelingService;
import ru.productallergen.userservice.userInfo.web.CommonFeelingWebDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CommonFeelingController.class)
class CommonFeelingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CommonFeelingService service;

    @MockitoBean
    private CommonFeelingMapper mapper;

    private ObjectMapper objectMapper;

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID FEELING_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private CommonFeelingWebDto sampleWebDto;
    private CommonFeelingDto sampleDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleWebDto = CommonFeelingWebDto.builder()
                .feelingId(FEELING_ID)
                .dateTime(LocalDateTime.parse("2024-06-01T10:00:00"))
                .wellbeingScore(8)
                .mood(7)
                .energyLevel(6)
                .comment("Feeling good")
                .build();

        sampleDto = CommonFeelingDto.builder()
                .feelingId(FEELING_ID)
                .userId(USER_ID)
                .dateTime(LocalDateTime.parse("2024-06-01T10:00:00"))
                .wellbeingScore(8)
                .mood(7)
                .energyLevel(6)
                .comment("Feeling good")
                .build();
    }

    @Test
    @DisplayName("POST /api/feelings/common — успешное создание записи")
    void createCommonFeeling_success() throws Exception {
        when(mapper.toDto(any(CommonFeelingWebDto.class))).thenReturn(sampleDto);
        when(service.createCommonFeeling(eq(USER_ID), any(CommonFeelingDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(post("/api/feelings/common")
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto))
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.feelingId").value(FEELING_ID.toString()))
                .andExpect(jsonPath("$.wellbeingScore").value(8))
                .andExpect(jsonPath("$.mood").value(7))
                .andExpect(jsonPath("$.energyLevel").value(6))
                .andExpect(jsonPath("$.comment").value("Feeling good"));

        verify(service).createCommonFeeling(eq(USER_ID), any(CommonFeelingDto.class));
    }

    @Test
    @DisplayName("POST /api/feelings/common — 401 без аутентификации")
    void createCommonFeeling_unauthorized() throws Exception {
        mockMvc.perform(post("/api/feelings/common")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto))
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/feelings/common — возвращает список записей пользователя")
    void getAllCommonFeelings_success() throws Exception {
        LocalDateTime from = LocalDateTime.parse("2024-06-01T10:00:00");
        LocalDateTime to = LocalDateTime.parse("2024-06-05T10:00:00");
        when(service.getCommonFeelingsByPeriod(USER_ID, from, to)).thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/common")
                        .with(userJwt())
                        .param("from", from.toString())
                        .param("to", to.toString())
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].feelingId").value(FEELING_ID.toString()));

        verify(service).getCommonFeelingsByPeriod(USER_ID, from, to);
    }

    @Test
    @DisplayName("GET /api/feelings/common — пустой список, если записей нет")
    void getAllCommonFeelings_empty() throws Exception {
        LocalDateTime from = LocalDateTime.parse("2024-06-01T10:00:00");
        LocalDateTime to = LocalDateTime.parse("2024-06-05T10:00:00");
        when(service.getCommonFeelingsByPeriod(USER_ID, from, to)).thenReturn(List.of());

        mockMvc.perform(get("/api/feelings/common")
                        .with(userJwt())
                        .param("from", from.toString())
                        .param("to", to.toString())
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/feelings/common/by-date — фильтрация по дате")
    void getCommonFeelingByDate_success() throws Exception {
        LocalDate date = LocalDate.of(2024, 6, 1);

        when(service.getCommonFeelingByDate(USER_ID, date)).thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/common/by-date")
                        .with(userJwt())
                        .param("date", "2024-06-01")
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].feelingId").value(FEELING_ID.toString()));

        verify(service).getCommonFeelingByDate(USER_ID, date);
    }

    @Test
    @DisplayName("GET /api/feelings/common/by-date — 400 без параметра date")
    void getCommonFeelingByDate_missingParam() throws Exception {
        mockMvc.perform(get("/api/feelings/common/by-date")
                        .with(userJwt()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/feelings/common/by-date — 400 при некорректном формате даты")
    void getCommonFeelingByDate_invalidFormat() throws Exception {
        mockMvc.perform(get("/api/feelings/common/by-date")
                        .with(userJwt())
                        .param("date", "01-06-2024"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/feelings/common/{feelingId} — успешное обновление")
    void updateCommonFeeling_success() throws Exception {
        when(mapper.toDto(any(CommonFeelingWebDto.class))).thenReturn(sampleDto);
        when(service.updateCommonFeeling(eq(USER_ID), eq(FEELING_ID), any(CommonFeelingDto.class)))
                .thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(put("/api/feelings/common/{feelingId}", FEELING_ID)
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto))
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feelingId").value(FEELING_ID.toString()))
                .andExpect(jsonPath("$.wellbeingScore").value(8));

        verify(service).updateCommonFeeling(eq(USER_ID), eq(FEELING_ID), any(CommonFeelingDto.class));
    }

    @Test
    @DisplayName("PUT /api/feelings/common/{feelingId} — 401 без аутентификации")
    void updateCommonFeeling_unauthorized() throws Exception {
        mockMvc.perform(put("/api/feelings/common/{feelingId}", FEELING_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }


    @Test
    @DisplayName("DELETE /api/feelings/common/{feelingId} — успешное удаление")
    void deleteCommonFeeling_success() throws Exception {
        doNothing().when(service).deleteCommonFeeling(USER_ID, FEELING_ID);

        mockMvc.perform(delete("/api/feelings/common/{feelingId}", FEELING_ID)
                        .with(userJwt())
                        .with(csrf())
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isNoContent());

        verify(service).deleteCommonFeeling(USER_ID, FEELING_ID);
    }

    @Test
    @DisplayName("DELETE /api/feelings/common/{feelingId} — 401 без аутентификации")
    void deleteCommonFeeling_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/feelings/common/{feelingId}", FEELING_ID)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    private RequestPostProcessor userJwt() {
        return user(USER_ID.toString());
    }
}