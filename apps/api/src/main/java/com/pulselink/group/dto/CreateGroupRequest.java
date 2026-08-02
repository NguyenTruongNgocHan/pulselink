package com.pulselink.group.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateGroupRequest(
        @NotBlank @Size(max = 100) String name,
        @Size(max = 99) List<UUID> memberIds
) {
    public CreateGroupRequest {
        memberIds = memberIds == null ? List.of() : List.copyOf(memberIds);
    }
}
