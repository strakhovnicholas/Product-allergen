package ru.productallergen.authservice.service;

import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.dto.auth.RegisterRequest;
import ru.productallergen.authservice.dto.user.UserDto;
import ru.productallergen.authservice.exception.InvalidCredentialsException;
import ru.productallergen.authservice.exception.UserNotFoundException;
import ru.productallergen.authservice.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;

    private final WebClient userServiceWebClient;

    private final RefreshTokenService refreshTokenService;

    public AuthResponse login(LoginRequest request) {
        UserDto user = userServiceWebClient.get()
                .uri("/users/email/{email}", request.email())
                .retrieve()
                .bodyToMono(UserDto.class)
                .block();

        if  (user == null) {
            throw new UserNotFoundException("User not found");
        }

        boolean valid = Boolean.TRUE.equals(userServiceWebClient.post()
                .uri("/users/{id}/check-password", user.id())
                .bodyValue(request.password())
                .retrieve()
                .bodyToMono(Boolean.class)
                .block());

        if (!valid){
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String accessToken = this.jwtService.generateAccessToken(user.email(), user.role(), user.id());
        String refreshToken = this.jwtService.generateRefreshToken(user.email());

        userServiceWebClient.post()
                .uri("/users/{id}/refresh-token", user.id())
                .bodyValue(refreshToken)
                .retrieve()
                .bodyToMono(Void.class)
                .block();

        return new AuthResponse(accessToken, refreshToken);
    }

    public void register(RegisterRequest request) {
    }
}
