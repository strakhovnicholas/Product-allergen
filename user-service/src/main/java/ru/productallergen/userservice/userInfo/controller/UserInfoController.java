package ru.productallergen.userservice.userInfo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;
import ru.productallergen.userservice.userInfo.service.UserInfoService;
import ru.productallergen.userservice.userInfo.web.UserInfoCreateRequest;
import ru.productallergen.userservice.userInfo.web.UserInfoUpdateRequest;
import ru.productallergen.userservice.userInfo.web.UserInfoWebDto;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Управление информацией о пользователе", description = "API для управления личной информацией пользователя")
public class UserInfoController {
    private final UserInfoService service;
    private final UserInfoMapper mapper;

    @Operation(summary = "Создать информацию о пользователе",
            description = "Добавляет новую запись с личной информацией пользователя в систему")
    @PostMapping("/user/info")
    public ResponseEntity<UserInfoWebDto> createUserInfo(@Parameter(description = "Данные для создания информации о пользователе", required = true)
                                                         @Valid @RequestBody UserInfoCreateRequest request,
                                                         @CurrentUserId UUID userId) {
        UserInfoWebDto response = mapper.toWebDto(service.createUserInfo(mapper.toDto(request, userId)));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить информацию о пользователе",
            description = "Возвращает личную информацию текущего пользователя")
    @GetMapping("/user/info")
    public ResponseEntity<UserInfoWebDto> getUserInfo(@CurrentUserId UUID userId) {
        UserInfoWebDto response = mapper.toWebDto(service.getUserInfo(userId));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить информацию о пользователе",
            description = "Полное обновление личной информации пользователя. Поля, не указанные в запросе, не обновляются")
    @PutMapping("/user/info")
    public ResponseEntity<UserInfoWebDto> updateUserInfo(@Parameter(description = "Обновленные данные информации о пользователе", required = true)
                                                         @Valid @RequestBody UserInfoUpdateRequest request,
                                                         @CurrentUserId  @RequestParam UUID userId) {
        UserInfoWebDto response = mapper.toWebDto(service.updateUserInfo(mapper.toDto(request, userId)));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Удалить информацию о пользователе",
            description = "Безвозвратно удаляет личную информацию пользователя")
    @DeleteMapping("/user/info")
    public ResponseEntity<Void> deleteUserInfo(@CurrentUserId UUID userId) {
        service.deleteUserInfo(userId);
        return ResponseEntity.noContent().build();
    }
}