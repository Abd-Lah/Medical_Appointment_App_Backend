package com.spring.demo_relationship.controller.user;

import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/authenticated")
    public ResponseEntity<UserEntity> userInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserEntity user = userRepository.findByEmail(authentication.getName());
        return new ResponseEntity<>(user, HttpStatus.ACCEPTED);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserEntity>> users() {
        List<UserEntity> users = userRepository.findAll();
        return new ResponseEntity<>(users, HttpStatus.ACCEPTED);
    }

}
