package com.pulselink.shared.ratelimit;

import java.io.IOException;
import java.time.Duration;
import java.util.Optional;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Small local-deployment rate limiter. Redis keeps the counters shared between
 * API instances while failures are handled fail-open so an unavailable cache
 * does not take the application offline.
 */
public class RedisRateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redis;

    public RedisRateLimitFilter(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Optional<Policy> policy = policy(request);
        if (policy.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        Policy selected = policy.get();
        String key = "ratelimit:" + selected.name() + ":" + clientAddress(request);
        try {
            Long count = redis.opsForValue().increment(key);
            if (count != null && count == 1L) {
                redis.expire(key, selected.window());
            }
            if (count != null && count > selected.limit()) {
                response.setStatus(429);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(
                        "{\"code\":\"RATE_LIMIT_EXCEEDED\","
                                + "\"message\":\"Too many requests. Please try again shortly.\"}"
                );
                return;
            }
        } catch (RuntimeException ignored) {
            // Redis is an optimization boundary; authorization still protects the route.
        }

        filterChain.doFilter(request, response);
    }

    private Optional<Policy> policy(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        if ("POST".equals(method) && path.matches("/api/v1/auth/(login|register|refresh)")) {
            return Optional.of(new Policy("auth", 20, Duration.ofMinutes(1)));
        }
        if ("POST".equals(method) && "/api/v1/files".equals(path)) {
            return Optional.of(new Policy("upload", 30, Duration.ofMinutes(1)));
        }
        if ("GET".equals(method)
                && ("/api/v1/people".equals(path) || "/api/v1/message-search".equals(path))) {
            return Optional.of(new Policy("search", 120, Duration.ofMinutes(1)));
        }
        return Optional.empty();
    }

    private String clientAddress(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",", 2)[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record Policy(String name, long limit, Duration window) { }
}
