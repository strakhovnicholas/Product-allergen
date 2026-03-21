package ru.productallergen.userservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


/**
 * Исключение, возникающее при отсутствии необходимой сущности в базе данных
 */
@RequiredArgsConstructor
@Getter
public class NotFoundException extends RuntimeException {
    private final String messageKey;
    private final Object id;
}
