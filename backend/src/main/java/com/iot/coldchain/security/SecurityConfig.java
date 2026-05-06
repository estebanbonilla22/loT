package com.iot.coldchain.security;

import com.iot.coldchain.user.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  UserDetailsService userDetailsService(UserRepository userRepository) {
    return username -> userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));
  }

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
    return http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/").permitAll()
            .requestMatchers("/api/auth/**", "/actuator/health").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/shipments").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/shipments/*").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/shipments").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/shipments/*").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/shipments/*").hasRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/readings").authenticated()
            .requestMatchers(HttpMethod.GET, "/api/readings/*").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/readings").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/readings/*").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/readings/*").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}
