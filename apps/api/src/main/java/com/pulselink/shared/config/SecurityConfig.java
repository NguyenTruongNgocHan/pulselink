package com.pulselink.shared.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.pulselink.auth.domain.UserRepository;
import com.pulselink.auth.security.JwtAuthenticationFilter;
import com.pulselink.auth.security.JwtService;
import com.pulselink.shared.ratelimit.RedisRateLimitFilter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtService jwtService,
            UserRepository userRepository,
            StringRedisTemplate redisTemplate
    ) throws Exception {
        JwtAuthenticationFilter jwtAuthenticationFilter =
                new JwtAuthenticationFilter(jwtService, userRepository);

        RedisRateLimitFilter redisRateLimitFilter =
                new RedisRateLimitFilter(redisTemplate);

        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/actuator/health",
                                "/api/v1/system/status",
                                "/api/v1/auth/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/logout",
                                "/ws/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        )
                        .permitAll()
                        .requestMatchers("/api/v1/admin/**")
                        .hasAnyRole("MODERATOR", "ADMIN", "SUPER_ADMIN")
                        .anyRequest()
                        .authenticated()
                )
                .addFilterBefore(
                        redisRateLimitFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .build();
    }

    private AuthenticationEntryPoint authenticationEntryPoint() {
        return (
                HttpServletRequest request,
                HttpServletResponse response,
                AuthenticationException exception
        ) -> writeSecurityError(
                response,
                HttpServletResponse.SC_UNAUTHORIZED,
                "AUTHENTICATION_REQUIRED",
                "Authentication is required to access this resource."
        );
    }

    private AccessDeniedHandler accessDeniedHandler() {
        return (
                HttpServletRequest request,
                HttpServletResponse response,
                org.springframework.security.access.AccessDeniedException exception
        ) -> writeSecurityError(
                response,
                HttpServletResponse.SC_FORBIDDEN,
                "ACCESS_DENIED",
                "You do not have permission to access this resource."
        );
    }

    private void writeSecurityError(
            HttpServletResponse response,
            int status,
            String code,
            String message
    ) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Pragma", "no-cache");

        String body = """
                {
                  "code": "%s",
                  "message": "%s"
                }
                """.formatted(code, message);

        response.getWriter().write(body);
    }
}