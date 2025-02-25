package com.spring.demo_relationship.security;

import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.repository.UserRepository;
import com.spring.demo_relationship.payload.UserPrincipal;
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
