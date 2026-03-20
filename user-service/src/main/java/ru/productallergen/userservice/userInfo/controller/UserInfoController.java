package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.mapper.UserInfoMapper;
import ru.productallergen.userservice.userInfo.service.UserInfoService;
import ru.productallergen.userservice.userInfo.web.UserInfoWebDto;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserInfoController {

    private final UserInfoService service;
    private final UserInfoMapper mapper;

    private UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    @PostMapping("/user/info")
    public UserInfoWebDto createUserInfo(@RequestBody UserInfoWebDto request,
                                         Authentication authentication) {
        UUID userId = getUserId(authentication);
        return mapper.toWebDto(service.createUserInfo(userId, mapper.toDto(request)));
    }

    @GetMapping("/user/info")
    public UserInfoWebDto getUserInfo(Authentication authentication) {
        UUID userId = getUserId(authentication);
        return mapper.toWebDto(service.getUserInfo(userId));
    }

    @PutMapping("/user/info")
    public UserInfoWebDto updateUserInfo(@RequestBody UserInfoWebDto request,
                                         Authentication authentication) {
        UUID userId = getUserId(authentication);
        return mapper.toWebDto(service.updateUserInfo(userId, mapper.toDto(request)));
    }

    @DeleteMapping("/user/info")
    public void deleteUserInfo(Authentication authentication) {
        UUID userId = getUserId(authentication);
        service.deleteUserInfo(userId);
    }
}
