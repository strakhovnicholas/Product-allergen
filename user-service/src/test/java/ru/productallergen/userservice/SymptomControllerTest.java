//package ru.productallergen.userservice;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.test.web.servlet.MockMvc;
//import ru.productallergen.userservice.symptoms.SymptomController;
//import ru.productallergen.userservice.symptoms.dto.SymptomCreateRequestDto;
//import ru.productallergen.userservice.symptoms.dto.SymptomEditRequestDto;
//import ru.productallergen.userservice.symptoms.dto.SymptomResponseDto;
//import ru.productallergen.userservice.symptoms.service.SymptomService;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
//import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
//
//@WebMvcTest(SymptomController.class)
//class SymptomControllerTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockitoBean
//    private SymptomService symptomService;
//
//    private ObjectMapper objectMapper;
//
//    private static final UUID MOCK_USER_ID = new UUID(0, 1);
//    private static final Long SYMPTOM_ID = 42L;
//
//    private SymptomResponseDto sampleResponse;
//
//    @BeforeEach
//    void setUp() {
//        objectMapper = new ObjectMapper();
//        objectMapper.registerModule(new JavaTimeModule());
//
//        sampleResponse = new SymptomResponseDto(
//                SYMPTOM_ID,
//                "Головная боль",
//                7,
//                LocalDateTime.parse("2026-03-21T10:00:00"),
//                LocalDateTime.parse("2026-03-21T12:30:00")
//        );
//    }
//
//    @Test
//    @DisplayName("GET /api/symptoms — возвращает список симптомов")
//    void getAllSymptoms_success() throws Exception {
//        when(symptomService.getAllUserSymptoms(MOCK_USER_ID)).thenReturn(List.of(sampleResponse));
//
//        mockMvc.perform(get("/api/symptoms")
//                        .with(user("test"))
//                        .header("X-User-Id", MOCK_USER_ID))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$").isArray())
//                .andExpect(jsonPath("$.length()").value(1))
//                .andExpect(jsonPath("$[0].id").value(SYMPTOM_ID))
//                .andExpect(jsonPath("$[0].symptomName").value("Головная боль"))
//                .andExpect(jsonPath("$[0].severity").value(7));
//
//        verify(symptomService).getAllUserSymptoms(MOCK_USER_ID);
//    }
//
//    @Test
//    @DisplayName("GET /api/symptoms — пустой список, если симптомов нет")
//    void getAllSymptoms_empty() throws Exception {
//        when(symptomService.getAllUserSymptoms(MOCK_USER_ID)).thenReturn(List.of());
//
//        mockMvc.perform(get("/api/symptoms")
//                        .with(user("test"))
//                        .header("X-User-Id", MOCK_USER_ID))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$").isArray())
//                .andExpect(jsonPath("$.length()").value(0));
//    }
//
//    @Test
//    @DisplayName("GET /api/symptoms — 401 без аутентификации")
//    void getAllSymptoms_unauthorized() throws Exception {
//        mockMvc.perform(get("/api/symptoms"))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    @DisplayName("POST /api/symptoms — успешное создание, возвращает 201")
//    void saveSymptom_success() throws Exception {
//        SymptomCreateRequestDto createRequest = new SymptomCreateRequestDto(
//                "Головная боль", 7
//        );
//
//        when(symptomService.save(any(SymptomCreateRequestDto.class), eq(MOCK_USER_ID)))
//                .thenReturn(sampleResponse);
//
//        mockMvc.perform(post("/api/symptoms")
//                        .with(user("test"))
//                        .with(csrf())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(createRequest))
//                        .header("X-User-Id", MOCK_USER_ID))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.id").value(SYMPTOM_ID))
//                .andExpect(jsonPath("$.symptomName").value("Головная боль"))
//                .andExpect(jsonPath("$.severity").value(7));
//
//        verify(symptomService).save(any(SymptomCreateRequestDto.class), eq(MOCK_USER_ID));
//    }
//
//    @Test
//    @DisplayName("POST /api/symptoms — 401 без аутентификации")
//    void saveSymptom_unauthorized() throws Exception {
//        mockMvc.perform(post("/api/symptoms")
//                        .with(csrf())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(new SymptomCreateRequestDto("X", 1))))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    @DisplayName("PUT /api/symptoms/{id} — успешное обновление")
//    void updateSymptom_success() throws Exception {
//        SymptomEditRequestDto editRequest = new SymptomEditRequestDto(
//                "Головная боль", 7
//        );
//
//        when(symptomService.update(eq(SYMPTOM_ID), any(SymptomEditRequestDto.class), eq(MOCK_USER_ID)))
//                .thenReturn(sampleResponse);
//
//        mockMvc.perform(put("/api/symptoms/{id}", SYMPTOM_ID)
//                        .with(user("test"))
//                        .with(csrf())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(editRequest))
//                        .header("X-User-Id", MOCK_USER_ID))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(SYMPTOM_ID))
//                .andExpect(jsonPath("$.symptomName").value("Головная боль"))
//                .andExpect(jsonPath("$.severity").value(7));
//
//        verify(symptomService).update(eq(SYMPTOM_ID), any(SymptomEditRequestDto.class), eq(MOCK_USER_ID));
//    }
//
//    @Test
//    @DisplayName("PUT /api/symptoms/{id} — 401 без аутентификации")
//    void updateSymptom_unauthorized() throws Exception {
//        mockMvc.perform(put("/api/symptoms/{id}", SYMPTOM_ID)
//                        .with(csrf())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(new SymptomEditRequestDto("X", 1))))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    @DisplayName("DELETE /api/symptoms/{id} — успешное удаление, возвращает 204")
//    void deleteSymptom_success() throws Exception {
//        doNothing().when(symptomService).delete(SYMPTOM_ID, MOCK_USER_ID);
//
//        mockMvc.perform(delete("/api/symptoms/{id}", SYMPTOM_ID)
//                        .with(user("test"))
//                        .with(csrf())
//                        .header("X-User-Id", MOCK_USER_ID))
//                .andExpect(status().isNoContent());
//
//        verify(symptomService).delete(SYMPTOM_ID, MOCK_USER_ID);
//    }
//
//    @Test
//    @DisplayName("DELETE /api/symptoms/{id} — 401 без аутентификации")
//    void deleteSymptom_unauthorized() throws Exception {
//        mockMvc.perform(delete("/api/symptoms/{id}", SYMPTOM_ID)
//                        .with(csrf()))
//                .andExpect(status().isUnauthorized());
//    }
//}