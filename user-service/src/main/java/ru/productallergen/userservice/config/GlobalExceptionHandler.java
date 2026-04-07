package ru.productallergen.userservice.config;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import ru.productallergen.userservice.exception.ApiErrorResponse;
import ru.productallergen.userservice.exception.NotFoundException;
import ru.productallergen.userservice.exception.UserHasNotAccess;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// без @Hidden ломается swagger
@Hidden
@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final String VALIDATION_FAILED = "validation.failed";

    /**
     * Обработка ошибок валидации (@Valid)
     * Возвращает статус 400 и список ошибок в поле details
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        List<Map<String, Object>> details = createValidationFailedDetails(ex
                .getBindingResult()
                .getFieldErrors());

        ApiErrorResponse error = ApiErrorResponse.builder()
                .code(HttpStatus.BAD_REQUEST.value())
                .errorType(HttpStatus.BAD_REQUEST.name())
                .message(VALIDATION_FAILED)
                .details(details)
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    private List<Map<String, Object>> createValidationFailedDetails(List<FieldError> fieldErrors) {
        return fieldErrors.stream()
                .map(fieldError -> {
                    Map<String, Object> detail = new HashMap<>();
                    detail.put("field", fieldError.getField());
                    detail.put("message", fieldError.getDefaultMessage());
                    return detail;
                })
                .collect(Collectors.toList());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFoundException(NotFoundException ex) {
        ApiErrorResponse response = ApiErrorResponse
                .builder()
                .code(HttpStatus.NOT_FOUND.value())
                .errorType(HttpStatus.NOT_FOUND.name())
                .message(ex.getMessageKey())
                .details(createNotFoundIdDetails(ex.getId()))
                .build();
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserHasNotAccess.class)
    public ResponseEntity<ApiErrorResponse> handleUserHasNotAccessException(UserHasNotAccess ex) {
        ApiErrorResponse response = ApiErrorResponse
                .builder()
                .code(HttpStatus.FORBIDDEN.value())
                .errorType(HttpStatus.FORBIDDEN.name())
                .message(ex.getMessageKey())
                .build();
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    private List<Map<String, Object>> createNotFoundIdDetails(Object id) {
        return Collections.singletonList(Map.of("itemId", id));
    }
}
