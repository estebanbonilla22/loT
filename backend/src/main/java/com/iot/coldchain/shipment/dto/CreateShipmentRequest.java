package com.iot.coldchain.shipment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateShipmentRequest(
    @NotBlank String productName,
    @NotBlank String origin,
    @NotBlank String destination,
    @NotNull Double minTemperature,
    @NotNull Double maxTemperature
) {}

