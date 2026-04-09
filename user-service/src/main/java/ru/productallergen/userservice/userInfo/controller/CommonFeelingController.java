package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.mapper.CommonFeelingMapper;
import ru.productallergen.userservice.userInfo.service.CommonFeelingService;
import ru.productallergen.userservice.userInfo.web.CommonFeelingWebDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommonFeelingController {

    private final CommonFeelingService service;
    private final CommonFeelingMapper mapper;

    private UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    @PostMapping("feelings/common")
    public CommonFeelingWebDto createCommonFeeling(@RequestBody CommonFeelingWebDto request,
                                                   Authentication authentication) {
        UUID userId = getUserId(authentication);

        return mapper.toWebDto(service.createCommonFeeling(userId, mapper.toDto(request)));
    }

    @GetMapping("feelings/common")
    public List<CommonFeelingWebDto> getAllCommonFeelings(Authentication authentication) {
        UUID userId = getUserId(authentication);

        return service.getAllCommonFeelings(userId)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @GetMapping("feelings/common/by-date")
    public List<CommonFeelingWebDto> getCommonFeelingByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                                            LocalDate date,
                                                            Authentication authentication) {
        UUID userId = getUserId(authentication);

        return service.getCommonFeelingByDate(userId, date)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @PutMapping("feelings/common/{feelingId}")
    public CommonFeelingWebDto updateCommonFeeling(@PathVariable UUID feelingId,
                                                   @RequestBody CommonFeelingWebDto request,
                                                   Authentication authentication) {
        UUID userId = getUserId(authentication);

        return mapper.toWebDto(service.updateCommonFeeling(userId, feelingId, mapper.toDto(request)));
    }

    @DeleteMapping("feelings/common/{feelingId}")
    public void deleteCommonFeeling(@PathVariable UUID feelingId,
                                    Authentication authentication) {

        UUID userId = getUserId(authentication);

        service.deleteCommonFeeling(userId, feelingId);
    }
}
