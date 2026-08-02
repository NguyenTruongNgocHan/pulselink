package com.pulselink.report.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReportClarificationRequest(
        @NotBlank @Size(max = 2000) String body
) { }
