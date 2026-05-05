package com.iot.coldchain.reading;

import com.iot.coldchain.shipment.Shipment;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "sensor_reading")
public class SensorReading {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "shipment_id", nullable = false)
  private Shipment shipment;

  @Column(nullable = false)
  private double temperature;

  @Column(nullable = false)
  private double humidity;

  @Column(nullable = false)
  private double latitude;

  @Column(nullable = false)
  private double longitude;

  @Column(nullable = false)
  private Instant timestamp;

  protected SensorReading() {}

  public SensorReading(Shipment shipment, double temperature, double humidity, double latitude, double longitude, Instant timestamp) {
    this.shipment = shipment;
    this.temperature = temperature;
    this.humidity = humidity;
    this.latitude = latitude;
    this.longitude = longitude;
    this.timestamp = timestamp;
  }

  public Long getId() {
    return id;
  }

  public Shipment getShipment() {
    return shipment;
  }

  public double getTemperature() {
    return temperature;
  }

  public void setTemperature(double temperature) {
    this.temperature = temperature;
  }

  public double getHumidity() {
    return humidity;
  }

  public void setHumidity(double humidity) {
    this.humidity = humidity;
  }

  public double getLatitude() {
    return latitude;
  }

  public void setLatitude(double latitude) {
    this.latitude = latitude;
  }

  public double getLongitude() {
    return longitude;
  }

  public void setLongitude(double longitude) {
    this.longitude = longitude;
  }

  public Instant getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Instant timestamp) {
    this.timestamp = timestamp;
  }
}

