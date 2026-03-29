package ru.productallergen.authservice.service.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.dto.auth.RegisterRequest;
import ru.productallergen.authservice.entity.User;
import ru.productallergen.authservice.exception.InvalidCredentialsException;
import ru.productallergen.authservice.exception.InvalidRefreshTokenException;
import ru.productallergen.authservice.exception.UserNotFoundException;
import ru.productallergen.authservice.repository.UserRepository;
import ru.productallergen.authservice.security.JwtService;
import ru.productallergen.authservice.service.storing.RefreshTokenService;

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
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("User already exists");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .isActive(true)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenService.saveRefreshToken(refreshToken, user.getEmail());

        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (Exception e) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenService.revokeOldTokensByEmail(user.getEmail());

        refreshTokenService.saveRefreshToken(refreshToken, user.getEmail());

        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwtService.validateToken(refreshToken, "refresh")) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }

        if (!refreshTokenService.isValid(refreshToken)) {
            throw new InvalidRefreshTokenException("Refresh token not found or revoked");
        }

        String email = refreshTokenService.getEmail(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String newAccessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());

        return new AuthResponse(newAccessToken, refreshToken);
    }

    public void logout(String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
    }
}