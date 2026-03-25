package ru.productallergen.authservice.service.auth;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.dto.auth.RegisterRequest;
import ru.productallergen.authservice.dto.user.UserDto;
import ru.productallergen.authservice.exception.InvalidCredentialsException;
import ru.productallergen.authservice.exception.InvalidRefreshTokenException;
import ru.productallergen.authservice.exception.UserNotFoundException;
import ru.productallergen.authservice.security.JwtService;
import ru.productallergen.authservice.service.storing.RefreshTokenService;

@Service
public class AuthService {

    private final JwtService jwtService;

    private final WebClient userServiceWebClient;

    private final RefreshTokenService refreshTokenService;

    @Value("${user.service.get-user-by-email}")
    private String getUserByEmailPath;

    @Value("${user.service.get-user-password-by-id}")
    private String getUserPasswordById;

    @Value("${user.service.create}")
    private String postCreateUser;

    @Autowired
    public AuthService(JwtService jwtService,
                       WebClient userServiceWebClient,
                       RefreshTokenService refreshTokenService) {
        this.jwtService = jwtService;
        this.userServiceWebClient = userServiceWebClient;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthResponse login(LoginRequest request) {
        UserDto user = this.userServiceWebClient.get()
                .uri(this.getUserByEmailPath, request.email())
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response ->
                        Mono.error(new RuntimeException("User not found")))
                .onStatus(HttpStatusCode::is5xxServerError, response ->
                        Mono.error(new RuntimeException("User service error")))
                .bodyToMono(UserDto.class)
                .block();

        if (user == null) {
            throw new UserNotFoundException("User not found");
        }

        boolean valid = Boolean.TRUE.equals(userServiceWebClient.post()
                .uri(this.getUserPasswordById, user.id())
                .bodyValue(request.password())
                .retrieve()
                .bodyToMono(Boolean.class)
                .block());

        if (!valid) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        String accessToken = this.jwtService.generateAccessToken(user.email(), user.role(), user.id());
        String refreshToken = this.jwtService.generateRefreshToken(user.email());

        this.refreshTokenService.saveRefreshToken(refreshToken, user.email());

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse register(RegisterRequest request) {
        UserDto user = userServiceWebClient.post()
                .uri(this.postCreateUser)
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                        response -> Mono.error(new RuntimeException("User already exists")))
                .onStatus(HttpStatusCode::is5xxServerError,
                        response -> Mono.error(new RuntimeException("User service error")))
                .bodyToMono(UserDto.class)
                .block();

        String accessToken = this.jwtService.generateAccessToken(user.email(), user.role(), user.id());
        String refreshToken = this.jwtService.generateRefreshToken(user.email());

        this.refreshTokenService.saveRefreshToken(refreshToken, user.email());

        return new AuthResponse(accessToken, refreshToken);

    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.validateToken(refreshToken, "refresh")) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }

        String email = this.refreshTokenService.getEmail(refreshToken);

        UserDto user = userServiceWebClient.get()
                .uri(this.getUserByEmailPath, email)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                        response -> Mono.error(new UserNotFoundException("User not found")))
                .onStatus(HttpStatusCode::is5xxServerError,
                        response -> Mono.error(new RuntimeException("User service error")))
                .bodyToMono(UserDto.class)
                .block();

        if (user == null)
            throw new UserNotFoundException("User not found");

        String newAccessToken = jwtService.generateAccessToken(user.email(), user.role(), user.id());

        return new AuthResponse(newAccessToken, refreshToken);
    }

    public void logout(String refreshToken) {
        this.refreshTokenService.revokeToken(refreshToken);
    }
}
