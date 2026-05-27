package ru.productallergen.analytics.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalGatewayFilter extends OncePerRequestFilter {

    private static final String INTERNAL_HEADER = "X-Internal-Gateway-Token";

    @Value("${internal.api.secret}")
    private String expectedSecret;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = request.getHeader(INTERNAL_HEADER);

        if (token == null || !token.equals(expectedSecret)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid internal gateway token");
            return;
        }

        String userId = request.getHeader("X-User-Id");

        if (userId != null) {
            request.setAttribute("currentUserId", userId);
        }

        filterChain.doFilter(request, response);
    }
}