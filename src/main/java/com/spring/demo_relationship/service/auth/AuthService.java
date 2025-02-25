package com.spring.demo_relationship.service.auth;

import com.spring.demo_relationship.commands.LoginCommand;
import com.spring.demo_relationship.commands.RegisterCommand;
import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.payload.JwtResponse;
import com.spring.demo_relationship.repository.DoctorProfileRepository;
import com.spring.demo_relationship.repository.UserRepository;
import com.spring.demo_relationship.util.JWTService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JWTService jwtService;

    private final AuthenticationManager authManager;

    private final UserRepository userRepository;

    private final DoctorProfileRepository doctorProfile;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    private String token = null;

    @Transactional
    public JwtResponse register(RegisterCommand user) {
        user.setPassword(encoder.encode(user.getPassword()));
        if(Objects.equals(user.getRole().toString(), "ADMIN")) {
            userRepository.save(user.toUserEntity());
        }
        if(Objects.equals(user.getRole().toString(), "PATIENT")) {
            userRepository.save(user.toUserEntity());
        }
        else if(Objects.equals(user.getRole().toString(), "DOCTOR")) {
            UserEntity createdUser = userRepository.save(user.toUserEntity());
            doctorProfile.save(new DoctorProfile(createdUser));
        }
        token = jwtService.generateToken(user.getEmail());
        return new JwtResponse(user.getEmail(),user.getFirstName(),user.getLastName(),user.getPhoneNumber(),token,user.getRole().toString());
    }

    public JwtResponse verify(LoginCommand user) {
        Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        if (authentication.isAuthenticated()) {
            UserEntity loggedUser = userRepository.findByEmail(user.getEmail());
            token = jwtService.generateToken(user.getEmail());
            return new JwtResponse(loggedUser.getEmail(),loggedUser.getFirstName(),loggedUser.getLastName(),loggedUser.getPhoneNumber(),token,loggedUser.getRole().toString());
        } else {
            throw new RuntimeException("Authentication failed");
        }
    }
}