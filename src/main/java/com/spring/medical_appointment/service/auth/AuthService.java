package com.spring.medical_appointment.service.auth;

import com.spring.medical_appointment.commands.LoginCommand;
import com.spring.medical_appointment.commands.RegisterCommand;
import com.spring.medical_appointment.models.DoctorProfile;
import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.payload.JwtResponse;
import com.spring.medical_appointment.repository.DoctorProfileRepository;
import com.spring.medical_appointment.repository.UserRepository;
import com.spring.medical_appointment.util.JWTService;
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