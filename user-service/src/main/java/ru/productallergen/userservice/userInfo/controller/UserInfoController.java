package ru.productallergen.userservice.userInfo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.config.CurrentUserId;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;
import ru.productallergen.userservice.userInfo.service.UserInfoService;
import ru.productallergen.userservice.userInfo.web.UserInfoWebDto;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Управление информацией о пользователе", description = "API для управления личной информацией пользователя")
public class UserInfoController {
    private final UserInfoService service;
    private final UserInfoMapper mapper;

    @Operation(summary = "Создать информацию")
    @PostMapping("/user/info")
    public ResponseEntity<UserInfoWebDto> createUserInfo(@RequestBody UserInfoWebDto request,
                                                         @CurrentUserId UUID userId) {
        UserInfoWebDto response = mapper.toWebDto(service.createUserInfo(userId, mapper.toDto(request)));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Получить информацию")
    @GetMapping("/user/info")
    public ResponseEntity<UserInfoWebDto> getUserInfo(@CurrentUserId UUID userId) {
        UserInfoWebDto response = mapper.toWebDto(service.getUserInfo(userId));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Обновить информацию")
    @PutMapping("/user/info")
    public ResponseEntity<UserInfoWebDto> updateUserInfo(@RequestBody UserInfoWebDto request,
                                                         @CurrentUserId UUID userId) {
        UserInfoWebDto response = mapper.toWebDto(service.updateUserInfo(userId, mapper.toDto(request)));
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Удалить информацию")
    @DeleteMapping("/user/info")
    public ResponseEntity<Void> deleteUserInfo(@CurrentUserId UUID userId) {
        service.deleteUserInfo(userId);
        return ResponseEntity.noContent().build();
    }
}