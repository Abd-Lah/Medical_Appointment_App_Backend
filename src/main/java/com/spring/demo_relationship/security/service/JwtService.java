package com.spring.demo_relationship.security.service;

import com.spring.demo_relationship.security.config.MyUserDetails;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
  String generateJwtToken(String username);
  String extractUserName(String token);
  boolean validateToken(String token, MyUserDetails userDetails);
}
