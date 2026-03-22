package ru.productallergen.userservice.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Builder
@Schema(description = "Модель ответа, содержащая информацию об ошибке")
public record ApiErrorResponse(
        @Schema(description = "Код статуса ошибки", example = "404")
        int code,

        @Schema(description = "Тип ошибки", example = "NOT_FOUND")
        String errorType,

        @Schema(description = "Ключ сообщения", example = "medicine.not.found")
        String message,

        @Schema(description = "Детали к ошибке",
                example = """
                        "fieldViolations": [
                          {
                            "field": "name",
                            "description": "Название не может быть пустым"
                          },
                          {
                            "field": "dosage",
                            "description": "Должно быть положительным числом"
                          }
                        ]
                        """)
        List<Map<String, Object>> details
) {
}
