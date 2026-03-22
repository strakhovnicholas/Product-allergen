package ru.productallergen.userservice.medicines;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.productallergen.userservice.medicines.dto.MedicineCreateRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineEditRequestDto;
import ru.productallergen.userservice.medicines.dto.MedicineResponseDto;
import ru.productallergen.userservice.medicines.service.MedicineService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
@Tag(name = "Управление лекарствами", description = "API для управления списком лекарств пользователя")
public class MedicineController {

    private final MedicineService medicineService;

    // TODO: 21.03.2026 Удалить после подключения микросервиса
    private static final UUID MOCK_USER_ID = new UUID(0, 1);

    @Operation(summary = "Получить список всех лекарств",
            description = "Возвращает полный список сохраненных лекарств для текущего пользователя")
    @GetMapping
    public ResponseEntity<List<MedicineResponseDto>> getAllMedicines() {
        return ResponseEntity.ok(medicineService.getAllUserMedicines(getUserId()));
    }

    @Operation(summary = "Сохранить новое лекарство", description = "Добавляет запись о приеме лекарства в систему")
    @PostMapping
    public ResponseEntity<MedicineResponseDto> saveMedicines(
            @Parameter(description = "Данные для создания записи о лекарстве", required = true)
            @RequestBody @Valid MedicineCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicineService.save(dto, getUserId()));
    }

    @Operation(summary = "Обновить существующее лекарство",
            description = "Полное обновление записи по ID. Поля, не указанные в запросе " +
                    "не обновляются")
    @PutMapping("/{id}")
    public ResponseEntity<MedicineResponseDto> updateMedicine(
            @Parameter(description = "ID лекарства для обновления", required = true)
            @PathVariable Long id,
            @Parameter(description = "Обновленные данные лекарства", required = true)
            @RequestBody @Valid MedicineEditRequestDto dto) {
        MedicineResponseDto updatedDto = medicineService.update(id, dto, getUserId());
        return ResponseEntity.ok(updatedDto);
    }

    @Operation(summary = "Удалить лекарство", description = "Безвозвратно удаляет запись о лекарстве по ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<MedicineResponseDto> deleteMedicine(
            @Parameter(description = "ID лекарства для удаления", required = true) @PathVariable Long id) {
        medicineService.delete(id, getUserId());
        return ResponseEntity.noContent().build();
    }

    private UUID getUserId() {
        return MOCK_USER_ID;
    }
}