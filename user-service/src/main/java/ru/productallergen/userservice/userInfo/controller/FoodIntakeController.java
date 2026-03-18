package ru.productallergen.userservice.userInfo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.userInfo.dto.FoodIntakeDto;
import ru.productallergen.userservice.userInfo.service.FoodIntakeService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FoodIntakeController {

    private final FoodIntakeService service;

    @PostMapping("/feelings/food/create")
    public FoodIntakeDto create(@RequestParam UUID userId,
                                @RequestBody FoodIntakeDto request) {
        return service.create(userId, request);
    }

    @GetMapping("/feelings/food/{id}")
    public List<FoodIntakeDto> getAll(@PathVariable("id") UUID userId) {
        return service.getAllByUser(userId);
    }

    @DeleteMapping("/feelings/food/{id}")
    public void delete(@PathVariable("id") UUID foodIntakeId) {
        service.delete(foodIntakeId);
    }
}
