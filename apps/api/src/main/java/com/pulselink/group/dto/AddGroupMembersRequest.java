package com.pulselink.group.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record AddGroupMembersRequest(
        @NotEmpty @Size(max = 99) List<UUID> memberIds
) { }
