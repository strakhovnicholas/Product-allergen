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
import ru.productallergen.userservice.userInfo.controller.UserInfoController;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;
import ru.productallergen.userservice.userInfo.service.UserInfoService;
import ru.productallergen.userservice.userInfo.web.UserInfoWebDto;

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

@WebMvcTest(UserInfoController.class)
class UserInfoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserInfoService service;

    @MockitoBean
    private UserInfoMapper mapper;

    private ObjectMapper objectMapper;

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private UserInfoWebDto sampleWebDto;
    private UserInfoDto sampleDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleWebDto = UserInfoWebDto.builder()
                .userId(USER_ID)
                .fullName("Иван Иванов")
                .age(30)
                .weight(75.5)
                .height(180)
                .gender(Gender.MALE)
                .country("Russia")
                .smoker(false)
                .alcohol(false)
                .sports(true)
                .chronicDiseases(List.of(ChronicDisease.DIABETES))
                .allergies(List.of("Pollen"))
                .predisposition(Predisposition.LOW)
                .medicationsRegular(List.of("Aspirin"))
                .doctorNotes("Healthy")
                .registeredAt(LocalDateTime.parse("2024-01-01T00:00:00+03:00"))
                .updatedAt(LocalDateTime.parse("2024-06-01T00:00:00+03:00"))
                .build();

        sampleDto = UserInfoDto.builder()
                .userId(USER_ID)
                .fullName("Иван Иванов")
                .age(30)
                .weight(75.5)
                .height(180)
                .gender(Gender.MALE)
                .country("Russia")
                .smoker(false)
                .alcohol(false)
                .sports(true)
                .chronicDiseases(List.of(ChronicDisease.DIABETES))
                .allergies(List.of("Pollen"))
                .predisposition(Predisposition.LOW)
                .medicationsRegular(List.of("Aspirin"))
                .doctorNotes("Healthy")
                .registeredAt(LocalDateTime.parse("2024-01-01T00:00:00+03:00"))
                .updatedAt(LocalDateTime.parse("2024-06-01T00:00:00+03:00"))
                .build();
    }


    @Test
    @DisplayName("POST /api/user/info — успешное создание профиля")
    void createUserInfo_success() throws Exception {
        when(mapper.toDto(any(UserInfoWebDto.class))).thenReturn(sampleDto);
        when(service.createUserInfo(eq(USER_ID), any(UserInfoDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(post("/api/user/info")
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID.toString()))
                .andExpect(jsonPath("$.fullName").value("Иван Иванов"))
                .andExpect(jsonPath("$.age").value(30))
                .andExpect(jsonPath("$.weight").value(75.5))
                .andExpect(jsonPath("$.height").value(180))
                .andExpect(jsonPath("$.country").value("Russia"))
                .andExpect(jsonPath("$.smoker").value(false))
                .andExpect(jsonPath("$.sports").value(true));

        verify(service).createUserInfo(eq(USER_ID), any(UserInfoDto.class));
    }

    @Test
    @DisplayName("POST /api/user/info — 401 без аутентификации")
    void createUserInfo_unauthorized() throws Exception {
        mockMvc.perform(post("/api/user/info")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/user/info — успешное получение профиля")
    void getUserInfo_success() throws Exception {
        when(service.getUserInfo(USER_ID)).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(get("/api/user/info")
                        .with(userJwt()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID.toString()))
                .andExpect(jsonPath("$.fullName").value("Иван Иванов"))
                .andExpect(jsonPath("$.age").value(30))
                .andExpect(jsonPath("$.doctorNotes").value("Healthy"));

        verify(service).getUserInfo(USER_ID);
    }

    @Test
    @DisplayName("GET /api/user/info — 401 без аутентификации")
    void getUserInfo_unauthorized() throws Exception {
        mockMvc.perform(get("/api/user/info"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/user/info — успешное обновление профиля")
    void updateUserInfo_success() throws Exception {
        when(mapper.toDto(any(UserInfoWebDto.class))).thenReturn(sampleDto);
        when(service.updateUserInfo(eq(USER_ID), any(UserInfoDto.class))).thenReturn(sampleDto);
        when(mapper.toWebDto(sampleDto)).thenReturn(sampleWebDto);

        mockMvc.perform(put("/api/user/info")
                        .with(userJwt())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(USER_ID.toString()))
                .andExpect(jsonPath("$.fullName").value("Иван Иванов"))
                .andExpect(jsonPath("$.weight").value(75.5));

        verify(service).updateUserInfo(eq(USER_ID), any(UserInfoDto.class));
    }

    @Test
    @DisplayName("PUT /api/user/info — 401 без аутентификации")
    void updateUserInfo_unauthorized() throws Exception {
        mockMvc.perform(put("/api/user/info")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleWebDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/user/info — успешное удаление профиля")
    void deleteUserInfo_success() throws Exception {
        doNothing().when(service).deleteUserInfo(USER_ID);

        mockMvc.perform(delete("/api/user/info")
                        .with(userJwt())
                        .with(csrf()))
                .andExpect(status().isOk());

        verify(service).deleteUserInfo(USER_ID);
    }

    @Test
    @DisplayName("DELETE /api/user/info — 401 без аутентификации")
    void deleteUserInfo_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/user/info")
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    private RequestPostProcessor userJwt() {
        return user(USER_ID.toString());
    }
}