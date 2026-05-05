package com.iot.coldchain.shipment;

import com.iot.coldchain.shipment.dto.CreateShipmentRequest;
import com.iot.coldchain.shipment.dto.ShipmentResponse;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {
  private final ShipmentService shipmentService;

  public ShipmentController(ShipmentService shipmentService) {
    this.shipmentService = shipmentService;
  }

  @GetMapping
  public List<ShipmentResponse> list() {
    return shipmentService.list().stream().map(ShipmentController::toResponse).toList();
  }

  @GetMapping("/{id}")
  public ShipmentResponse get(@PathVariable Long id) {
    return toResponse(shipmentService.get(id));
  }

  @PostMapping
  public ShipmentResponse create(@Valid @RequestBody CreateShipmentRequest req) {
    return toResponse(shipmentService.create(req));
  }

  @PutMapping("/{id}")
  public ShipmentResponse update(@PathVariable Long id, @Valid @RequestBody CreateShipmentRequest req) {
    return toResponse(shipmentService.update(id, req));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable Long id) {
    shipmentService.delete(id);
    return ResponseEntity.noContent().build();
  }

  static ShipmentResponse toResponse(Shipment s) {
    return new ShipmentResponse(
        s.getId(),
        s.getProductName(),
        s.getOrigin(),
        s.getDestination(),
        s.getMinTemperature(),
        s.getMaxTemperature(),
        s.getStatus(),
        s.getCreatedAt()
    );
  }
}

