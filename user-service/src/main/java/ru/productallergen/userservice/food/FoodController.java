package ru.productallergen.userservice.food;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.productallergen.userservice.food.dto.FoodCreateRequestDto;
import ru.productallergen.userservice.food.dto.FoodEditRequestDto;
import ru.productallergen.userservice.food.dto.FoodResponseDto;
import ru.productallergen.userservice.food.service.FoodService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/food")
@RequiredArgsConstructor
@Tag(name = "Управление блюдами", description = "API для управления списком блюд пользователя")
public class FoodController {

    private final FoodService foodService;

    // TODO: 21.03.2026 Удалить после подключения микросервиса аутентификации
    private static final UUID MOCK_USER_ID = new UUID(0, 1);

    @Operation(summary = "Получить список всех блюд",
            description = "Возвращает полный список сохранённых блюд для текущего пользователя")
    @GetMapping
    public ResponseEntity<List<FoodResponseDto>> getAllFoods() {
        return ResponseEntity.ok(foodService.getAllUserFoods(getUserId()));
    }

    @Operation(summary = "Поиск блюд по названию",
            description = "Возвращает список блюд, название которых начинается с указанного префикса")
    @GetMapping("/search")
    public ResponseEntity<List<FoodResponseDto>> searchFoods(
            @Parameter(description = "Начало названия блюда для поиска", required = true)
            @RequestParam String prefix) {
        return ResponseEntity.ok(foodService.searchByFoodName(getUserId(), prefix));
    }

    @Operation(summary = "Сохранить новое блюдо", description = "Добавляет запись о блюде в систему")
    @PostMapping
    public ResponseEntity<FoodResponseDto> saveFood(
            @Parameter(description = "Данные для создания записи о блюде", required = true)
            @RequestBody @Valid FoodCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(foodService.save(dto, getUserId()));
    }

    @Operation(summary = "Обновить существующее блюдо",
            description = "Частичное обновление записи по ID. Поля, не указанные в запросе, не обновляются")
    @PutMapping("/{id}")
    public ResponseEntity<FoodResponseDto> updateFood(
            @Parameter(description = "ID блюда для обновления", required = true)
            @PathVariable Long id,
            @Parameter(description = "Обновлённые данные блюда", required = true)
            @RequestBody @Valid FoodEditRequestDto dto) {
        FoodResponseDto updatedDto = foodService.update(id, dto, getUserId());
        return ResponseEntity.ok(updatedDto);
    }

    @Operation(summary = "Удалить блюдо", description = "Безвозвратно удаляет запись о блюде по ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFood(
            @Parameter(description = "ID блюда для удаления", required = true)
            @PathVariable Long id) {
        foodService.delete(id, getUserId());
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId() {
        return MOCK_USER_ID;
    }
}