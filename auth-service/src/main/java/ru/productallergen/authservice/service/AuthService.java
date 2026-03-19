package ru.productallergen.authservice.service;

import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;
import ru.productallergen.authservice.dto.AuthResponse;
import ru.productallergen.authservice.dto.LoginRequest;
import ru.productallergen.authservice.dto.RegisterRequest;
import ru.productallergen.authservice.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtService jwtService;
    private final UserService userService;

    public AuthResponse login(LoginRequest request) {
        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!userService.checkPassword(user, request.password())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public void register(RegisterRequest request) {
        userService.createUser(request.email(), request.password());
    }
}
