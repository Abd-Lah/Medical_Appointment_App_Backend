package com.spring.medical_appointment.security;

import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.repository.UserRepository;
import com.spring.medical_appointment.payload.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            System.out.println("User Not Found");
            return null;
        }

        return new UserPrincipal(user);
    }
}
