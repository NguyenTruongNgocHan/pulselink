package com.pulselink.auth.session;

import org.springframework.stereotype.Component;

import com.pulselink.auth.domain.RefreshToken.SessionMetadata;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class SessionMetadataResolver {

    public SessionMetadata resolve(HttpServletRequest request) {
        String userAgent = value(request.getHeader("User-Agent"), "Unknown client");
        String browser = browser(userAgent);
        String operatingSystem = operatingSystem(userAgent);
        String deviceName = deviceName(userAgent, operatingSystem);
        String forwardedFor = request.getHeader("X-Forwarded-For");
        String ipAddress = forwardedFor == null || forwardedFor.isBlank()
                ? request.getRemoteAddr()
                : forwardedFor.split(",")[0].trim();
        return new SessionMetadata(deviceName, browser, operatingSystem, ipAddress, null);
    }

    private String browser(String userAgent) {
        if (userAgent.contains("Edg/")) return "Microsoft Edge";
        if (userAgent.contains("Chrome/")) return "Chrome";
        if (userAgent.contains("Firefox/")) return "Firefox";
        if (userAgent.contains("Safari/") && !userAgent.contains("Chrome/")) return "Safari";
        return "Unknown browser";
    }

    private String operatingSystem(String userAgent) {
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac OS X")) return "macOS";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iPhone") || userAgent.contains("iPad")) return "iOS";
        if (userAgent.contains("Linux")) return "Linux";
        return "Unknown operating system";
    }

    private String deviceName(String userAgent, String operatingSystem) {
        if (userAgent.contains("Mobile") || userAgent.contains("Android") || userAgent.contains("iPhone")) {
            return operatingSystem + " mobile device";
        }
        return operatingSystem + " computer";
    }

    private String value(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
