package com.iot.coldchain.reading;

import com.iot.coldchain.reading.dto.CreateSensorReadingRequest;
import com.iot.coldchain.shipment.Shipment;
import com.iot.coldchain.shipment.ShipmentService;
import com.iot.coldchain.web.NotFoundException;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SensorReadingService {
  private final SensorReadingRepository sensorReadingRepository;
  private final ShipmentService shipmentService;

  public SensorReadingService(SensorReadingRepository sensorReadingRepository, ShipmentService shipmentService) {
    this.sensorReadingRepository = sensorReadingRepository;
    this.shipmentService = shipmentService;
  }

  public List<SensorReading> listByShipment(Long shipmentId) {
    return sensorReadingRepository.findByShipmentIdOrderByTimestampDesc(shipmentId);
  }

  public SensorReading get(Long id) {
    return sensorReadingRepository.findById(id).orElseThrow(() -> new NotFoundException("Sensor reading not found"));
  }

  @Transactional
  public SensorReading create(CreateSensorReadingRequest req) {
    Shipment shipment = shipmentService.get(req.shipmentId());
    Instant ts = req.timestamp() != null ? req.timestamp() : Instant.now();
    SensorReading reading = new SensorReading(
        shipment,
        req.temperature(),
        req.humidity(),
        req.latitude(),
        req.longitude(),
        ts
    );

    sensorReadingRepository.save(reading);
    shipmentService.updateStatusByTemperature(shipment, reading.getTemperature());
    return reading;
  }

  @Transactional
  public SensorReading update(Long id, CreateSensorReadingRequest req) {
    SensorReading existing = get(id);
    if (!existing.getShipment().getId().equals(req.shipmentId())) {
      throw new IllegalArgumentException("Cannot change shipmentId of a reading");
    }
    existing.setTemperature(req.temperature());
    existing.setHumidity(req.humidity());
    existing.setLatitude(req.latitude());
    existing.setLongitude(req.longitude());
    existing.setTimestamp(req.timestamp() != null ? req.timestamp() : existing.getTimestamp());
    shipmentService.updateStatusByTemperature(existing.getShipment(), existing.getTemperature());
    return existing;
  }

  public void delete(Long id) {
    sensorReadingRepository.deleteById(id);
  }
}

