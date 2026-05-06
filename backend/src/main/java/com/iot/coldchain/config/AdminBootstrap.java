package com.iot.coldchain.config;

import com.iot.coldchain.user.AppUser;
import com.iot.coldchain.user.UserRepository;
import com.iot.coldchain.user.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBootstrap implements ApplicationRunner {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Value("${app.bootstrap-admin.username:}")
  private String bootstrapUsername;

  @Value("${app.bootstrap-admin.password:}")
  private String bootstrapPassword;

  public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    userRepository.findAll().forEach(u -> {
      if (u.getRole() == null) {
        u.setRole(UserRole.USER);
        userRepository.save(u);
      }
    });

    if (bootstrapUsername == null || bootstrapUsername.isBlank()
        || bootstrapPassword == null || bootstrapPassword.isBlank()) {
      return;
    }
    if (userRepository.existsByUsername(bootstrapUsername.trim())) {
      return;
    }
    AppUser admin = new AppUser(
        bootstrapUsername.trim(),
        passwordEncoder.encode(bootstrapPassword),
        UserRole.ADMIN);
    userRepository.save(admin);
  }
}
