package com.spring.demo_relationship.security.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class AppRole {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer Id;
    private String roleName;
}
