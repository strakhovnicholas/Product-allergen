package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.dto.UserInfoDto;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;
import ru.productallergen.userservice.userInfo.service.UserInfoService;
import ru.productallergen.userservice.userInfo.web.UserInfoWebDto;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserInfoController {

    private final UserInfoService service;
    private final UserInfoMapper mapper;

    @PostMapping("/user/info/create")
    public UserInfoWebDto create(@RequestBody UserInfoWebDto request) {
        UserInfoDto dto = mapper.toDtoFromWeb(request);
        dto.setUserId(UUID.randomUUID());
        dto.setRegisteredAt(ZonedDateTime.now());
        dto.setUpdatedAt(ZonedDateTime.now());
        return mapper.toWebDto(service.create(dto));
    }

    @GetMapping("/user/info/{id}")
    public UserInfoWebDto get(@PathVariable("id") UUID userId) {
        return service.getByUserId(userId)
                .map(mapper::toWebDto)
                .orElse(null);
    }

    @GetMapping("/user/info/all")
    public List<UserInfoWebDto> getAll() {
        return service.getAll().stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @PutMapping("/user/info/update/{userId}")
    public UserInfoWebDto update(@PathVariable UUID userId,
                                 @RequestBody UserInfoWebDto request) {
        UserInfoDto dto = mapper.toDtoFromWeb(request);
        dto.setUserId(userId);
        dto.setUpdatedAt(ZonedDateTime.now());
        return mapper.toWebDto(service.update(userId, dto));
    }

    @DeleteMapping("/user/info/delete/{userId}")
    public void delete(@PathVariable UUID userId) {
        service.delete(userId);
    }
}
