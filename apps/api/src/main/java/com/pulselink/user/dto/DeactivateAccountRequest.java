package com.pulselink.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DeactivateAccountRequest(
        @NotBlank @Size(max = 500) String reason
) { }
