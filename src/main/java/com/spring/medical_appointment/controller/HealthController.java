package com.spring.medical_appointment.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Provides endpoints to check if the server is running
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Health check endpoint
     * @return Server status and timestamp
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("service", "Medical Appointment System");
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Simple ping endpoint
     * @return Simple OK response
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("OK");
    }
} 