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
import ru.productallergen.userservice.medicines.MedicineController;
import ru.productallergen.userservice.medicines.dto.MedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineEditRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineResponseDto;
import ru.productallergen.userservice.medicines.entity.Unit;
import ru.productallergen.userservice.medicines.service.MedicineService;

import java.time.ZonedDateTime;
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

@WebMvcTest(MedicineController.class)
class MedicineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MedicineService medicineService;

    private ObjectMapper objectMapper;

    private static final UUID MOCK_USER_ID = new UUID(0, 1);

    private static final Long MEDICINE_ID = 105L;

    private MedicineResponseDto sampleResponse;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleResponse = new MedicineResponseDto(
                MEDICINE_ID,
                "Парацетамол",
                500,
                Unit.MG,
                ZonedDateTime.parse("2023-10-27T10:00:00+03:00"),
                ZonedDateTime.parse("2023-10-27T12:15:00+03:00")
        );
    }

    @Test
    @DisplayName("GET /api/medicines — возвращает список лекарств")
    void getAllMedicines_success() throws Exception {
        when(medicineService.getAllUserMedicines(MOCK_USER_ID)).thenReturn(List.of(sampleResponse));

        mockMvc.perform(get("/api/medicines")
                        .with(user("test")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(MEDICINE_ID))
                .andExpect(jsonPath("$[0].medicineName").value("Парацетамол"))
                .andExpect(jsonPath("$[0].dosage").value(500));

        verify(medicineService).getAllUserMedicines(MOCK_USER_ID);
    }

    @Test
    @DisplayName("GET /api/medicines — пустой список, если лекарств нет")
    void getAllMedicines_empty() throws Exception {
        when(medicineService.getAllUserMedicines(MOCK_USER_ID)).thenReturn(List.of());

        mockMvc.perform(get("/api/medicines")
                        .with(user("test")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("GET /api/medicines — 401 без аутентификации")
    void getAllMedicines_unauthorized() throws Exception {
        mockMvc.perform(get("/api/medicines"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/medicines — успешное создание, возвращает 201")
    void saveMedicine_success() throws Exception {
        MedicineCreateRequestDto createRequest = new MedicineCreateRequestDto(
                "Парацетамол", 500, Unit.MG
        );

        when(medicineService.save(any(MedicineCreateRequestDto.class), eq(MOCK_USER_ID)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/medicines")
                        .with(user("test"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(MEDICINE_ID))
                .andExpect(jsonPath("$.medicineName").value("Парацетамол"))
                .andExpect(jsonPath("$.dosage").value(500))
                .andExpect(jsonPath("$.unit").value("MG"));

        verify(medicineService).save(any(MedicineCreateRequestDto.class), eq(MOCK_USER_ID));
    }

    @Test
    @DisplayName("POST /api/medicines — 401 без аутентификации")
    void saveMedicine_unauthorized() throws Exception {
        mockMvc.perform(post("/api/medicines")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new MedicineCreateRequestDto("X", 1, Unit.MG))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/medicines/{id} — успешное обновление")
    void updateMedicine_success() throws Exception {
        MedicineEditRequestDto editRequest = new MedicineEditRequestDto(
                "Парацетамол", 500, Unit.MG
        );

        when(medicineService.update(eq(MEDICINE_ID), any(MedicineEditRequestDto.class), eq(MOCK_USER_ID)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/medicines/{id}", MEDICINE_ID)
                        .with(user("test"))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(MEDICINE_ID))
                .andExpect(jsonPath("$.medicineName").value("Парацетамол"))
                .andExpect(jsonPath("$.dosage").value(500));

        verify(medicineService).update(eq(MEDICINE_ID), any(MedicineEditRequestDto.class), eq(MOCK_USER_ID));
    }

    @Test
    @DisplayName("PUT /api/medicines/{id} — 401 без аутентификации")
    void updateMedicine_unauthorized() throws Exception {
        mockMvc.perform(put("/api/medicines/{id}", MEDICINE_ID)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new MedicineEditRequestDto("X", 1, Unit.MG))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/medicines/{id} — успешное удаление, возвращает 204")
    void deleteMedicine_success() throws Exception {
        doNothing().when(medicineService).delete(MEDICINE_ID, MOCK_USER_ID);

        mockMvc.perform(delete("/api/medicines/{id}", MEDICINE_ID)
                        .with(user("test"))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(medicineService).delete(MEDICINE_ID, MOCK_USER_ID);
    }

    @Test
    @DisplayName("DELETE /api/medicines/{id} — 401 без аутентификации")
    void deleteMedicine_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/medicines/{id}", MEDICINE_ID)
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }
}