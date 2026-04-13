package ru.productallergen.userservice;

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
import ru.productallergen.userservice.food.FoodController;
import ru.productallergen.userservice.food.dto.FoodCreateRequestDto;
import ru.productallergen.userservice.food.dto.FoodEditRequestDto;
import ru.productallergen.userservice.food.dto.FoodResponseDto;
import ru.productallergen.userservice.food.service.FoodService;
import ru.productallergen.userservice.userInfo.FoodCategory;

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

@WebMvcTest(FoodController.class)
class FoodControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FoodService foodService;

    private ObjectMapper objectMapper;

    private static final UUID MOCK_USER_ID = new UUID(0, 1);
    private static final Long FOOD_ID = 105L;

    private FoodResponseDto sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleResponse = new FoodResponseDto(
                FOOD_ID,
                "Яблоко",
                FoodCategory.FRUIT,
                List.of("Яблоко"),
                LocalDateTime.parse("2023-10-27T10:00:00+03:00"),
                LocalDateTime.parse("2023-10-27T12:15:00+03:00")
        );
    }

    @Test
    @DisplayName("GET /api/food — возвращает список блюд")
    void getAllFoods_success() throws Exception {
        when(foodService.getAllUserFoods(MOCK_USER_ID)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/food")
                        .with(user("test")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(FOOD_ID))
                .andExpect(jsonPath("$[0].foodName").value("Яблоко"))
                .andExpect(jsonPath("$[0].category").value("FRUIT"));

        verify(foodService).getAllUserFoods(MOCK_USER_ID);
    }

    @Test
    @DisplayName("GET /api/food — пустой список, если блюд нет")
    void getAllFoods_empty() throws Exception {
        when(foodService.getAllUserFoods(MOCK_USER_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/food")
                        .with(user("test")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/food — 401 без аутентификации")
    void getAllFoods_unauthorized() throws Exception {
        mockMvc.perform(get("/api/food"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/food/search — возвращает блюда по префиксу")
    void searchFoods_success() throws Exception {
        when(foodService.searchByFoodName(MOCK_USER_ID, "Яб")).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/food/search")
                        .with(user("test"))
                        .param("prefix", "Яб"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].foodName").value("Яблоко"));

        verify(foodService).searchByFoodName(MOCK_USER_ID, "Яб");
    }

    @Test
    @DisplayName("GET /api/food/search — пустой список, если ничего не найдено")
    void searchFoods_noResults() throws Exception {
        when(foodService.searchByFoodName(MOCK_USER_ID, "xyz")).thenReturn(List.of());

        mockMvc.perform(get("/api/food/search")
                        .with(user("test"))
                        .param("prefix", "xyz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/food/search — 400 без параметра prefix")
    void searchFoods_missingPrefix() throws Exception {
        mockMvc.perform(get("/api/food/search")
                        .with(user("test")))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/food/search — 401 без аутентификации")
    void searchFoods_unauthorized() throws Exception {
        mockMvc.perform(get("/api/food/search")
                        .param("prefix", "Яб"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/food — успешное создание, возвращает 201")
    void saveFood_success() throws Exception {
        FoodCreateRequestDto createRequest = new FoodCreateRequestDto(
                "Яблоко", FoodCategory.FRUIT, List.of("Яблоко")
        );

        when(foodService.save(any(FoodCreateRequestDto.class), eq(MOCK_USER_ID)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/food")
                        .with(user("test"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(FOOD_ID))
                .andExpect(jsonPath("$.foodName").value("Яблоко"))
                .andExpect(jsonPath("$.category").value("FRUIT"));

        verify(foodService).save(any(FoodCreateRequestDto.class), eq(MOCK_USER_ID));
    }

    @Test
    @DisplayName("POST /api/food — 401 без аутентификации")
    void saveFood_unauthorized() throws Exception {
        mockMvc.perform(post("/api/food")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new FoodCreateRequestDto("X", FoodCategory.FRUIT, List.of()))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/food/{id} — успешное обновление")
    void updateFood_success() throws Exception {
        FoodEditRequestDto editRequest = new FoodEditRequestDto(
                "Яблоко", FoodCategory.FRUIT, List.of("Яблоко")
        );

        when(foodService.update(eq(FOOD_ID), any(FoodEditRequestDto.class), eq(MOCK_USER_ID)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/food/{id}", FOOD_ID)
                        .with(user("test"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(FOOD_ID))
                .andExpect(jsonPath("$.foodName").value("Яблоко"))
                .andExpect(jsonPath("$.category").value("FRUIT"));

        verify(foodService).update(eq(FOOD_ID), any(FoodEditRequestDto.class), eq(MOCK_USER_ID));
    }

    @Test
    @DisplayName("PUT /api/food/{id} — 401 без аутентификации")
    void updateFood_unauthorized() throws Exception {
        mockMvc.perform(put("/api/food/{id}", FOOD_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new FoodEditRequestDto("X", FoodCategory.FRUIT, List.of()))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/food/{id} — успешное удаление, возвращает 204")
    void deleteFood_success() throws Exception {
        doNothing().when(foodService).delete(FOOD_ID, MOCK_USER_ID);

        mockMvc.perform(delete("/api/food/{id}", FOOD_ID)
                        .with(user("test"))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(foodService).delete(FOOD_ID, MOCK_USER_ID);
    }

    @Test
    @DisplayName("DELETE /api/food/{id} — 401 без аутентификации")
    void deleteFood_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/food/{id}", FOOD_ID)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}