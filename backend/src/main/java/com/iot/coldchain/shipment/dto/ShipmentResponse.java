package com.iot.coldchain.shipment.dto;

import com.iot.coldchain.shipment.ShipmentStatus;
import java.time.Instant;

public record ShipmentResponse(
    Long id,
    String productName,
    String origin,
    String destination,
    double minTemperature,
    double maxTemperature,
    ShipmentStatus status,
    Instant createdAt
) {}

