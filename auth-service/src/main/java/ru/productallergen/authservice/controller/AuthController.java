package ru.productallergen.authservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.productallergen.authservice.cookie.CookieFactory;
import ru.productallergen.authservice.dto.auth.*;
import ru.productallergen.authservice.security.JwtService;
import ru.productallergen.authservice.service.auth.AuthService;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieFactory cookieFactory;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String refreshToken = extractRefreshTokenFromCookies(request);

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        ResponseCookie deleteAccess = cookieFactory.deleteAccessToken();
        ResponseCookie deleteRefresh = cookieFactory.deleteRefreshToken();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteAccess.toString())
                .header(HttpHeaders.SET_COOKIE, deleteRefresh.toString())
                .body("Logged out successfully");
    }

    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);

        boolean isValid = jwtService.validateToken(token, "access");

        if (!isValid) {
            return ResponseEntity.status(401)
                    .body(new TokenValidationResponse(false, null, null, "Invalid token"));
        }

        String email = jwtService.extractEmail(token);
        String userId = jwtService.extractId(token);

        return ResponseEntity.ok(new TokenValidationResponse(true, email, UUID.fromString(userId), null));
    }

    @PostMapping("/validate/internal")
    public ResponseEntity<TokenValidationResponse> validateTokenInternal(@RequestBody TokenValidationRequest request) {
        boolean isValid = jwtService.validateToken(request.token(), "access");

        if (!isValid) {
            return ResponseEntity.ok(new TokenValidationResponse(false, null, null, "Invalid token"));
        }

        String email = jwtService.extractEmail(request.token());
        String userId = jwtService.extractId(request.token());

        return ResponseEntity.ok(new TokenValidationResponse(true, email, UUID.fromString(userId), null));
    }

    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        for (var cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

}