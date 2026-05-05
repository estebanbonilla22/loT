package com.iot.coldchain.reading;

import com.iot.coldchain.reading.dto.CreateSensorReadingRequest;
import com.iot.coldchain.reading.dto.SensorReadingResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/readings")
public class SensorReadingController {
  private final SensorReadingService sensorReadingService;

  public SensorReadingController(SensorReadingService sensorReadingService) {
    this.sensorReadingService = sensorReadingService;
  }

  @GetMapping
  public List<SensorReadingResponse> listByShipment(@RequestParam Long shipmentId) {
    return sensorReadingService.listByShipment(shipmentId).stream().map(SensorReadingController::toResponse).toList();
  }

  @GetMapping("/{id}")
  public SensorReadingResponse get(@PathVariable Long id) {
    return toResponse(sensorReadingService.get(id));
  }

  @PostMapping
  public SensorReadingResponse create(@Valid @RequestBody CreateSensorReadingRequest req) {
    return toResponse(sensorReadingService.create(req));
  }

  @PutMapping("/{id}")
  public SensorReadingResponse update(@PathVariable Long id, @Valid @RequestBody CreateSensorReadingRequest req) {
    return toResponse(sensorReadingService.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    sensorReadingService.delete(id);
    return ResponseEntity.noContent().build();
  }

  static SensorReadingResponse toResponse(SensorReading r) {
    return new SensorReadingResponse(
        r.getId(),
        r.getShipment().getId(),
        r.getTemperature(),
        r.getHumidity(),
        r.getLatitude(),
        r.getLongitude(),
        r.getTimestamp()
    );
  }
}

