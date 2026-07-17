package com.pulselink.shared.web;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemStatusController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return Map.of(
                "service", "pulselink-api",
                "status", "UP",
                "timestamp", Instant.now().toString()
        );
    }
}