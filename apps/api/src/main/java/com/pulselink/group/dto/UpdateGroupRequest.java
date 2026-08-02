package com.pulselink.group.dto;

import jakarta.validation.constraints.Size;

public record UpdateGroupRequest(
        @Size(min = 1, max = 100) String name,
        @Size(max = 500) String avatarObjectKey
) { }
