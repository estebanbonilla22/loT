package com.iot.coldchain.reading.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record CreateSensorReadingRequest(
    @NotNull Long shipmentId,
    @NotNull Double temperature,
    @NotNull Double humidity,
    @NotNull Double latitude,
    @NotNull Double longitude,
    Instant timestamp
) {}

