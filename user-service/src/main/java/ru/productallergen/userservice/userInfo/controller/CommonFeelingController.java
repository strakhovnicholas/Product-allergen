package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.dto.CommonFeelingDto;
import ru.productallergen.userservice.userInfo.service.CommonFeelingService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommonFeelingController {

    private final CommonFeelingService service;

    @PostMapping("/feelings/common/create")
    public CommonFeelingDto create(@RequestParam UUID userId,
                                   @RequestBody CommonFeelingDto request) {
        return service.create(userId, request);
    }

    @GetMapping("/feelings/common/")
    public List<CommonFeelingDto> getByDate(@RequestParam UUID userId,
                                            @RequestParam
                                            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                            LocalDate date) {
        return service.getByUserAndDate(userId, date);
    }

    @DeleteMapping("/feelings/common/{id}")
    public void delete(@PathVariable("id") UUID feelingId) {
        service.delete(feelingId);
    }
}
