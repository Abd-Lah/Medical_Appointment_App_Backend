package com.spring.medical_appointment.controller.auth;


import com.spring.medical_appointment.commands.LoginCommand;
import com.spring.medical_appointment.commands.RegisterCommand;
import com.spring.medical_appointment.payload.JwtResponse;
import com.spring.medical_appointment.service.auth.AuthService;
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
    public ResponseEntity<JwtResponse> login(@RequestBody LoginCommand login){
        JwtResponse user = authService.verify(login);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@RequestBody RegisterCommand user){
        JwtResponse data = authService.register(user);
        return new ResponseEntity<>(data, HttpStatus.CREATED);
    }
}
