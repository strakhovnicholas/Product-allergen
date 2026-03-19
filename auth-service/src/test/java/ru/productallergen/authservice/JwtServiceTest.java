package ru.productallergen.authservice;

import lombok.Data;
import org.junit.jupiter.api.Test;
import ru.productallergen.authservice.security.JwtService;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void generateAndExtractEmail_shouldWork() {
        // mock user
        var user = new User();
        user.setEmail("test@example.com");

        // generate token
        String token = jwtService.generateToken(user);

        // extract email
        String email = jwtService.extractEmail(token);

        assertEquals(user.getEmail(), email);
        assertNotNull(token);
    }


}
