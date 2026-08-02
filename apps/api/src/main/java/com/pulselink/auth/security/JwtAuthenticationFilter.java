package com.pulselink.auth.security;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.pulselink.auth.domain.User;
import com.pulselink.auth.domain.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null
                && header.startsWith(BEARER_PREFIX)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(BEARER_PREFIX.length());
            jwtService.parse(token).flatMap(claims -> userRepository.findById(claims.userId())
                    .filter(user -> isValid(user, claims)))
                    .ifPresent(user -> SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(
                                    user.getId(),
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                            )
                    ));
        }

        filterChain.doFilter(request, response);
    }

    private boolean isValid(User user, JwtService.AccessTokenClaims claims) {
        if (user.getTokenVersion() != claims.tokenVersion()) {
            return false;
        }
        if (!user.getRole().name().equals(claims.role())) {
            return false;
        }
        if (user.getStatus() == User.Status.ACTIVE) {
            return true;
        }
        return user.getStatus() == User.Status.SUSPENDED
                && user.getSuspendedUntil() != null
                && user.getSuspendedUntil().isBefore(Instant.now());
    }
}
