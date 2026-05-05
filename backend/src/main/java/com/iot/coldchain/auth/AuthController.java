package com.iot.coldchain.auth;

import com.iot.coldchain.auth.dto.AuthResponse;
import com.iot.coldchain.auth.dto.LoginRequest;
import com.iot.coldchain.auth.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
    String token = authService.register(req);
    return ResponseEntity.ok(new AuthResponse(token));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    String token = authService.login(req);
    return ResponseEntity.ok(new AuthResponse(token));
  }
}

