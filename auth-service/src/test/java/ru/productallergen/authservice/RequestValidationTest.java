package ru.productallergen.authservice;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;
import ru.productallergen.authservice.dto.auth.RegisterRequest;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

class RequestValidationTest {
    private final Validator validator;

    RequestValidationTest() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void whenEmailIsInvalid_thenValidationFails() {
        RegisterRequest request = new RegisterRequest("not-an-email", "password123!");
        var violations = validator.validate(request);
        assertThat(violations).isNotEmpty();
    }

    @Test
    void whenPasswordContainsCyrillic_thenValidationFails() {
        RegisterRequest request = new RegisterRequest("test@test.com", "пароль123");
        var violations = validator.validate(request);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("латинские буквы"));
    }

    @Test
    void whenPasswordTooShort_thenValidationFails() {
        RegisterRequest request = new RegisterRequest("test@test.com", "12345");
        var violations = validator.validate(request);
        assertThat(violations).anyMatch(v -> v.getMessage().contains("минимум 6 символов"));
    }
}
