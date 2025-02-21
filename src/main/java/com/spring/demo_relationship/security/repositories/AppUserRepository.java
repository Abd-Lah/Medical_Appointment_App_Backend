package com.spring.demo_relationship.security.repositories;

import com.spring.demo_relationship.security.entities.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Integer> {
    AppUser findByEmail(String email);
    AppUser findByUsername(String username);
}
