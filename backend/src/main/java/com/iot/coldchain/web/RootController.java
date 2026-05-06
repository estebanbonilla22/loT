package com.iot.coldchain.web;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Respuesta en la raiz para que el enlace del ALB no muestre 403 en el navegador. */
@RestController
public class RootController {

  @GetMapping("/")
  public Map<String, Object> root() {
    return Map.of(
        "service", "Cold Chain IoT API",
        "message", "REST API is running. Use the paths below (GET in browser or Postman).",
        "health", "/actuator/health",
        "register", "POST /api/auth/register (JSON body: username, password)",
        "login", "POST /api/auth/login (JSON body: username, password)",
        "shipments", "GET /api/shipments (requires Bearer JWT)",
        "readings", "GET /api/readings?shipmentId= (requires Bearer JWT)");
  }
}
