package com.spring.demo_relationship.controller.auth;


import com.spring.demo_relationship.commands.LoginCommand;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginCommand login){
        String token = authService.verify(login);
        return new ResponseEntity<>(token, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody UserEntity user){
        String token = authService.register(user);
        return new ResponseEntity<>(token, HttpStatus.CREATED);
    }
}
