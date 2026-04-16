package ru.productallergen.authservice.service.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.dto.auth.RegisterRequest;
import ru.productallergen.authservice.entity.User;
import ru.productallergen.authservice.exception.*;
import ru.productallergen.authservice.repository.UserRepository;
import ru.productallergen.authservice.security.JwtService;
import ru.productallergen.authservice.service.storing.RefreshTokenService;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Attempting to register new user with email: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            log.warn("Registration failed: User with email {} already exists", request.email());
            throw new UserAlreadyExistsException("User with email " + request.email() + " already exists");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .isActive(true)
                .build();

        user = userRepository.save(user);
        log.info("User successfully registered with ID: {}", user.getId());

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenService.saveRefreshToken(refreshToken, user.getEmail());

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (Exception e) {
            log.warn("Login failed for user {}: Invalid credentials", request.email());
            throw new InvalidCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> {
                    log.error("Login critical error: User {} authenticated but not found in DB", request.email());
                    return new UserNotFoundException("User not found");
                });

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenService.revokeOldTokensByEmail(user.getEmail());
        refreshTokenService.saveRefreshToken(refreshToken, user.getEmail());

        log.info("User {} successfully logged in. Issued new tokens.", request.email());
        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse refresh(String refreshToken) {
        log.info("Attempting to refresh access token using refresh token");

        if (!jwtService.validateToken(refreshToken, "refresh")) {
            log.warn("Refresh failed: Token signature or expiration is invalid");
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }

        if (!refreshTokenService.isValid(refreshToken)) {
            log.warn("Refresh failed: Token is revoked or not found in storage");
            throw new InvalidRefreshTokenException("Refresh token not found or revoked");
        }

        String email = refreshTokenService.getEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Refresh critical error: User {} not found for valid token", email);
                    return new UserNotFoundException("User not found");
                });

        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        log.info("Access token successfully refreshed for user: {}", email);

        return new AuthResponse(newAccessToken, refreshToken);
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            log.info("Logging out: Revoking refresh token");
            refreshTokenService.revokeToken(refreshToken);
        } else {
            log.debug("Logout called with empty token");
        }
    }
}