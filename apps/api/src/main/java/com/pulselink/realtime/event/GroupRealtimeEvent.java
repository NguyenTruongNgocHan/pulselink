package com.pulselink.realtime.event;

import java.util.Map;
import java.util.UUID;

public record GroupRealtimeEvent(
        UUID groupId,
        Map<String, Object> payload
) { }
