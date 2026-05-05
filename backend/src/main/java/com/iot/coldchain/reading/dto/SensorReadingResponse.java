package com.iot.coldchain.reading.dto;

import java.time.Instant;

public record SensorReadingResponse(
    Long id,
    Long shipmentId,
    double temperature,
    double humidity,
    double latitude,
    double longitude,
    Instant timestamp
) {}

