package ru.productallergen.authservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.productallergen.authservice.cookie.CookieFactory;
import ru.productallergen.authservice.dto.auth.AuthResponse;
import ru.productallergen.authservice.dto.auth.LoginRequest;
import ru.productallergen.authservice.dto.auth.RegisterRequest;
import ru.productallergen.authservice.service.auth.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final CookieFactory cookieFactory;

    public AuthController(AuthService authService, CookieFactory cookieFactory) {
        this.authService = authService;
        this.cookieFactory = cookieFactory;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);

        ResponseCookie accessCookie = cookieFactory.createAccessToken(authResponse.accessToken());
        ResponseCookie refreshCookie = cookieFactory.createRefreshToken(authResponse.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);

        ResponseCookie accessCookie = cookieFactory.createAccessToken(authResponse.accessToken());
        ResponseCookie refreshCookie = cookieFactory.createRefreshToken(authResponse.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .build();
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