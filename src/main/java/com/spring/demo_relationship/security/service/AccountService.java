package com.spring.demo_relationship.security.service;

import com.spring.demo_relationship.security.entities.AppRole;
import com.spring.demo_relationship.security.entities.AppUser;

import java.util.List;

public interface AccountService {
    AppUser addUser(AppUser user);
    AppRole addRole(AppRole role);
    void assignRoleToUser(AppUser user, AppRole role);
    void removeRoleFromUser(AppUser user, AppRole role);
    AppUser getUserByEmail(String email);
    List<AppUser> getAllUsers();
    String verify(AppUser user);
}
