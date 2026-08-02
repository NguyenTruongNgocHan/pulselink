package com.pulselink.realtime;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class PresenceController {

    @MessageMapping("/presence/heartbeat")
    public void heartbeat(Principal principal) {
        // The inbound channel interceptor refreshes the Redis-backed session TTL.
        // A handler is kept so the STOMP destination remains explicit and documented.
        if (principal == null) {
            throw new IllegalArgumentException("WebSocket authentication is required");
        }
    }
}
