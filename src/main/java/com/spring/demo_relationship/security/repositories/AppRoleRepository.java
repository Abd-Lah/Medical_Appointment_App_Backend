package com.spring.demo_relationship.security.repositories;

import com.spring.demo_relationship.security.entities.AppRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppRoleRepository extends JpaRepository<AppRole, Integer> {
    AppRole findRoleByRoleName(String roleName);
}
