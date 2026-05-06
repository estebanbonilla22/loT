package com.iot.coldchain.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final JwtProperties props;
  private final SecretKey key;

  public JwtService(JwtProperties props) {
    this.props = props;
    this.key = Keys.hmacShaKeyFor(props.secret().getBytes(StandardCharsets.UTF_8));
  }

  public String generateToken(UserDetails user) {
    List<String> roles = user.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .toList();
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(props.expirationSeconds());
    return Jwts.builder()
        .issuer(props.issuer())
        .subject(user.getUsername())
        .claim("roles", roles)
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public String validateAndGetSubject(String token) {
    Claims claims = Jwts.parser()
        .verifyWith(key)
        .requireIssuer(props.issuer())
        .build()
        .parseSignedClaims(token)
        .getPayload();
    return claims.getSubject();
  }
}
