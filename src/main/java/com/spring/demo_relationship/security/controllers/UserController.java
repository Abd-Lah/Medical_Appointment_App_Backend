package com.spring.demo_relationship.security.controllers;

import com.spring.demo_relationship.security.entities.AppUser;
import com.spring.demo_relationship.security.repositories.AppRoleRepository;
import com.spring.demo_relationship.security.repositories.AppUserRepository;
import com.spring.demo_relationship.security.service.AccountService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
@AllArgsConstructor
public class UserController {
    private final AppUserRepository appUserRepository;
    private final AccountService accountService;
    private final AppRoleRepository roleRepository;

    @PostMapping("/auth/register")
    public ResponseEntity<AppUser> registerUser(@RequestBody AppUser user) {
        AppUser userCreated = accountService.addUser(user);
        accountService.assignRoleToUser(user, roleRepository.findRoleByRoleName("user"));
        return new ResponseEntity<>(userCreated, HttpStatus.CREATED) ;
    }

    @PostMapping("/auth/login")
    public ResponseEntity<String> login(@RequestBody AppUser user) {
        String connected = accountService.verify(user);
        return new ResponseEntity<>(connected, HttpStatus.OK);
    }

    @GetMapping("/auth/user")
    public ResponseEntity<AppUser> userInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        AppUser user = appUserRepository.findByUsername(authentication.getName());
        return new ResponseEntity<>(user, HttpStatus.ACCEPTED);
    }
}
