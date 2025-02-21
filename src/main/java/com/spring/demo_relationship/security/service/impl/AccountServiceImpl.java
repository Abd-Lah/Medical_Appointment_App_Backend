package com.spring.demo_relationship.security.service.impl;

import com.spring.demo_relationship.security.entities.AppRole;
import com.spring.demo_relationship.security.entities.AppUser;
import com.spring.demo_relationship.security.repositories.AppRoleRepository;
import com.spring.demo_relationship.security.repositories.AppUserRepository;
import com.spring.demo_relationship.security.service.AccountService;
import com.spring.demo_relationship.security.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
@AllArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AppUserRepository appUserRepository;
    private final AppRoleRepository appRoleRepository;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    @Override
    public AppUser addUser(AppUser user) {
        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        return appUserRepository.save(user);
    }

    @Override
    public AppRole addRole(AppRole role) {

        return appRoleRepository.save(role);
    }

    public void assignRoleToUser(AppUser user, AppRole role) {
        // Ensure the AppRole is managed (attached to the persistence context)
        AppRole managedRole = appRoleRepository.findById(role.getId())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        // Ensure the AppUser is managed (attached to the persistence context)
        AppUser managedUser = appUserRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Add the role to the user's roles collection
        managedUser.getRoles().add(managedRole);

        // Save the user (no need to save the role explicitly in a unidirectional relationship)
        appUserRepository.save(managedUser);
    }

    @Override
    public void removeRoleFromUser(AppUser user, AppRole role) {
        user.getRoles().remove(role);
    }

    @Override
    public AppUser getUserByEmail(String email) {

        return appUserRepository.findByEmail(email);
    }

    @Override
    public List<AppUser> getAllUsers() {

        return appUserRepository.findAll();
    }

    public String verify(AppUser user) {
        Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        if (auth.isAuthenticated()) {
            return jwtService.generateJwtToken(user.getEmail());
        }
        return "Bad credentials";
    }
}
