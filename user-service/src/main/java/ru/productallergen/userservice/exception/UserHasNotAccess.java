package ru.productallergen.userservice.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Исключение если пользователь не имеет доступа к выполнению действия
 */
@RequiredArgsConstructor
@Getter
public class UserHasNotAccess extends RuntimeException {
    private final String messageKey;
}

