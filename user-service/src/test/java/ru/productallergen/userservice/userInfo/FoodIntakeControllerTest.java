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
import ru.productallergen.userservice.userInfo.controller.FoodIntakeController;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.mapper.FoodIntakeMapper;
import ru.productallergen.userservice.userInfo.service.FoodIntakeService;
import ru.productallergen.userservice.userInfo.web.FoodIntakeWebDto;

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

@WebMvcTest(FoodIntakeController.class)
class FoodIntakeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FoodIntakeService service;

    @MockitoBean
    private FoodIntakeMapper mapper;

    private ObjectMapper objectMapper;

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID FOOD_INTAKE_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    private FoodIntakeWebDto sampleWebDto;
    private FoodIntakeDto sampleDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleWebDto = FoodIntakeWebDto.builder()
                .foodIntakeId(FOOD_INTAKE_ID)
                .foodName("Apple")
                .category(FoodCategory.FRUIT)
                .amount(150.0)
                .unit(FoodUnit.GRAM)
                .intakeTime(LocalDateTime.parse("2024-06-01T08:00:00"))
                .reactionOccurred(false)
                .reactionDescription(null)
                .createdAt(LocalDateTime.parse("2024-06-01T08:05:00"))
                .build();

        sampleDto = FoodIntakeDto.builder()
                .foodIntakeId(FOOD_INTAKE_ID)
                .userId(USER_ID)
                .foodName("Apple")
                .category(FoodCategory.FRUIT)
                .amount(150.0)
                .unit(FoodUnit.GRAM)
                .intakeTime(LocalDateTime.parse("2024-06-01T08:00:00"))
                .reactionOccurred(false)
                .reactionDescription(null)
                .createdAt(LocalDateTime.parse("2024-06-01T08:05:00"))
                .build();
    }

    @Test
    @DisplayName("POST /api/feelings/food — успешное создание записи")
    void create_success() throws Exception {
        when(mapper.toDto(any(FoodIntakeWebDto.class))).thenReturn(sampleDto);
        when(service.createFoodIntake(eq(USER_ID), any(FoodIntakeDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(post("/api/feelings/food")
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto))
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.foodIntakeId").value(FOOD_INTAKE_ID.toString()))
                .andExpect(jsonPath("$.foodName").value("Apple"))
                .andExpect(jsonPath("$.amount").value(150.0))
                .andExpect(jsonPath("$.reactionOccurred").value(false));

        verify(service).createFoodIntake(eq(USER_ID), any(FoodIntakeDto.class));
    }

    @Test
    @DisplayName("POST /api/feelings/food — 401 без аутентификации")
    void create_unauthorized() throws Exception {
        mockMvc.perform(post("/api/feelings/food")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/feelings/food — возвращает список записей пользователя")
    void getAll_success() throws Exception {
        when(service.getAllFoodsIntake(USER_ID)).thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/food")
                        .with(userJwt())
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].foodIntakeId").value(FOOD_INTAKE_ID.toString()))
                .andExpect(jsonPath("$[0].foodName").value("Apple"));

        verify(service).getAllFoodsIntake(USER_ID);
    }

    @Test
    @DisplayName("GET /api/feelings/food — пустой список, если записей нет")
    void getAll_empty() throws Exception {
        when(service.getAllFoodsIntake(USER_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/feelings/food")
                        .with(userJwt())
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/feelings/food — 401 без аутентификации")
    void getAll_unauthorized() throws Exception {
        mockMvc.perform(get("/api/feelings/food"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/feelings/food/by-date — фильтрация по дате")
    void getByDate_success() throws Exception {
        LocalDate date = LocalDate.of(2024, 6, 1);

        when(service.getFoodIntakeByDate(USER_ID, date)).thenReturn(List.of(sampleDto));
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/feelings/food/by-date")
                        .with(userJwt())
                        .param("date", "2024-06-01")
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].foodIntakeId").value(FOOD_INTAKE_ID.toString()));

        verify(service).getFoodIntakeByDate(USER_ID, date);
    }

    @Test
    @DisplayName("GET /api/feelings/food/by-date — 400 без параметра date")
    void getByDate_missingParam() throws Exception {
        mockMvc.perform(get("/api/feelings/food/by-date")
                        .with(userJwt()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/feelings/food/by-date — 400 при некорректном формате даты")
    void getByDate_invalidFormat() throws Exception {
        mockMvc.perform(get("/api/feelings/food/by-date")
                        .with(userJwt())
                        .param("date", "01-06-2024"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/feelings/food/{foodIntakeId} — успешное обновление")
    void update_success() throws Exception {
        when(mapper.toDto(any(FoodIntakeWebDto.class))).thenReturn(sampleDto);
        when(service.updateFoodIntake(eq(USER_ID), eq(FOOD_INTAKE_ID), any(FoodIntakeDto.class)))
                .thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(put("/api/feelings/food/{foodIntakeId}", FOOD_INTAKE_ID)
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto))
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.foodIntakeId").value(FOOD_INTAKE_ID.toString()))
                .andExpect(jsonPath("$.foodName").value("Apple"))
                .andExpect(jsonPath("$.amount").value(150.0));

        verify(service).updateFoodIntake(eq(USER_ID), eq(FOOD_INTAKE_ID), any(FoodIntakeDto.class));
    }

    @Test
    @DisplayName("PUT /api/feelings/food/{foodIntakeId} — 401 без аутентификации")
    void update_unauthorized() throws Exception {
        mockMvc.perform(put("/api/feelings/food/{foodIntakeId}", FOOD_INTAKE_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/feelings/food/{foodIntakeId} — успешное удаление")
    void delete_success() throws Exception {
        doNothing().when(service).deleteFoodIntake(USER_ID, FOOD_INTAKE_ID);

        mockMvc.perform(delete("/api/feelings/food/{foodIntakeId}", FOOD_INTAKE_ID)
                        .with(userJwt())
                        .with(csrf())
                        .header("X-User-Id", USER_ID))
                .andExpect(status().isNoContent());

        verify(service).deleteFoodIntake(USER_ID, FOOD_INTAKE_ID);
    }

    @Test
    @DisplayName("DELETE /api/feelings/food/{foodIntakeId} — 401 без аутентификации")
    void delete_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/feelings/food/{foodIntakeId}", FOOD_INTAKE_ID)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    private RequestPostProcessor userJwt() {
        return user(USER_ID.toString());
    }
}