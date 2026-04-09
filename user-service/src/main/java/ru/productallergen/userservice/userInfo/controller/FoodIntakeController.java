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
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.mapper.FoodIntakeMapper;
import ru.productallergen.userservice.userInfo.service.FoodIntakeService;
import ru.productallergen.userservice.userInfo.web.FoodIntakeWebDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FoodIntakeController {

    private final FoodIntakeService service;
    private final FoodIntakeMapper mapper;

    private UUID getUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    @PostMapping("/feelings/food")
    public FoodIntakeWebDto create(@RequestBody FoodIntakeWebDto request,
                                   Authentication authentication) {

        UUID userId = getUserId(authentication);

        return mapper.toWebDto(service.createFoodIntake(userId, mapper.toDto(request)));
    }

    @GetMapping("/feelings/food")
    public List<FoodIntakeWebDto> getAll(Authentication authentication) {
        UUID userId = getUserId(authentication);

        return service.getAllFoodsIntake(userId)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @GetMapping("/feelings/food/by-date")
    public List<FoodIntakeWebDto> getByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                                            LocalDate date,
                                            Authentication authentication) {

        UUID userId = getUserId(authentication);

        return service.getFoodIntakeByDate(userId, date)
                .stream()
                .map(mapper::toWebDto)
                .toList();
    }

    @PutMapping("/feelings/food/{foodIntakeId}")
    public FoodIntakeWebDto update(@PathVariable UUID foodIntakeId,
                                   @RequestBody FoodIntakeWebDto request,
                                   Authentication authentication) {

        UUID userId = getUserId(authentication);
        FoodIntakeDto dto = mapper.toDto(request);

        return mapper.toWebDto(service.updateFoodIntake(userId, foodIntakeId, dto));
    }

    @DeleteMapping("/feelings/food/{foodIntakeId}")
    public void delete(@PathVariable UUID foodIntakeId,
                       Authentication authentication) {

        UUID userId = getUserId(authentication);
        service.deleteFoodIntake(userId, foodIntakeId);
    }
}
