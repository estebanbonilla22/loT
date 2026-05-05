package com.iot.coldchain.auth;

import com.iot.coldchain.auth.dto.LoginRequest;
import com.iot.coldchain.auth.dto.RegisterRequest;
import com.iot.coldchain.security.JwtService;
import com.iot.coldchain.user.AppUser;
import com.iot.coldchain.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public String register(RegisterRequest req) {
    if (userRepository.existsByUsername(req.username())) {
      throw new IllegalArgumentException("Username already exists");
    }
    AppUser user = new AppUser(req.username(), passwordEncoder.encode(req.password()));
    userRepository.save(user);
    return jwtService.generateToken(user.getUsername());
  }

  public String login(LoginRequest req) {
    AppUser user = userRepository.findByUsername(req.username())
        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
    if (!passwordEncoder.matches(req.password(), user.getPassword())) {
      throw new IllegalArgumentException("Invalid credentials");
    }
    return jwtService.generateToken(user.getUsername());
  }
}

