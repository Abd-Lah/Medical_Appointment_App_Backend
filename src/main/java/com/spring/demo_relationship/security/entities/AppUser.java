package com.spring.demo_relationship.security.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collection;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String username;
    private String email;
    private String password;
    private Boolean enabled;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles", // Name of the join table
            joinColumns = @JoinColumn(name = "user_id"), // Column in the join table for AppUser
            inverseJoinColumns = @JoinColumn(name = "role_id") // Column in the join table for AppRole
    )
    private Collection<AppRole> roles = new ArrayList<>();
}