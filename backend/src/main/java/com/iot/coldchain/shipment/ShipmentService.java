package com.iot.coldchain.shipment;

import com.iot.coldchain.shipment.dto.CreateShipmentRequest;
import com.iot.coldchain.web.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ShipmentService {
  private final ShipmentRepository shipmentRepository;

  public ShipmentService(ShipmentRepository shipmentRepository) {
    this.shipmentRepository = shipmentRepository;
  }

  public List<Shipment> list() {
    return shipmentRepository.findAll();
  }

  public Shipment get(Long id) {
    return shipmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Shipment not found"));
  }

  public Shipment create(CreateShipmentRequest req) {
    Shipment shipment = new Shipment(req.productName(), req.origin(), req.destination(), req.minTemperature(), req.maxTemperature());
    shipment.setStatus(ShipmentStatus.OK);
    return shipmentRepository.save(shipment);
  }

  @Transactional
  public Shipment update(Long id, CreateShipmentRequest req) {
    Shipment shipment = get(id);
    shipment.setProductName(req.productName());
    shipment.setOrigin(req.origin());
    shipment.setDestination(req.destination());
    shipment.setMinTemperature(req.minTemperature());
    shipment.setMaxTemperature(req.maxTemperature());
    return shipment;
  }

  public void delete(Long id) {
    shipmentRepository.deleteById(id);
  }

  @Transactional
  public Shipment updateStatusByTemperature(Shipment shipment, double temperature) {
    if (temperature < shipment.getMinTemperature() || temperature > shipment.getMaxTemperature()) {
      shipment.setStatus(ShipmentStatus.ALERT);
    } else {
      shipment.setStatus(ShipmentStatus.OK);
    }
    return shipment;
  }
}

