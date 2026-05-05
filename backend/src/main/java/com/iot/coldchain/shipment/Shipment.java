package com.iot.coldchain.shipment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "shipment")
public class Shipment {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String productName;

  @Column(nullable = false)
  private String origin;

  @Column(nullable = false)
  private String destination;

  @Column(nullable = false)
  private double minTemperature;

  @Column(nullable = false)
  private double maxTemperature;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private ShipmentStatus status = ShipmentStatus.OK;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  protected Shipment() {}

  public Shipment(String productName, String origin, String destination, double minTemperature, double maxTemperature) {
    this.productName = productName;
    this.origin = origin;
    this.destination = destination;
    this.minTemperature = minTemperature;
    this.maxTemperature = maxTemperature;
  }

  public Long getId() {
    return id;
  }

  public String getProductName() {
    return productName;
  }

  public void setProductName(String productName) {
    this.productName = productName;
  }

  public String getOrigin() {
    return origin;
  }

  public void setOrigin(String origin) {
    this.origin = origin;
  }

  public String getDestination() {
    return destination;
  }

  public void setDestination(String destination) {
    this.destination = destination;
  }

  public double getMinTemperature() {
    return minTemperature;
  }

  public void setMinTemperature(double minTemperature) {
    this.minTemperature = minTemperature;
  }

  public double getMaxTemperature() {
    return maxTemperature;
  }

  public void setMaxTemperature(double maxTemperature) {
    this.maxTemperature = maxTemperature;
  }

  public ShipmentStatus getStatus() {
    return status;
  }

  public void setStatus(ShipmentStatus status) {
    this.status = status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}

