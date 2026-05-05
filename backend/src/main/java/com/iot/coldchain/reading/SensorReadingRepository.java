package com.iot.coldchain.reading;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
  List<SensorReading> findByShipmentIdOrderByTimestampDesc(Long shipmentId);
}

