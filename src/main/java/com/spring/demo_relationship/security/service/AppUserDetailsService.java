package com.spring.demo_relationship.security.service;

import com.spring.demo_relationship.security.config.MyUserDetails;
import com.spring.demo_relationship.security.entities.AppUser;
import com.spring.demo_relationship.security.repositories.AppUserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AppUserDetailsService implements UserDetailsService {
    AppUserRepository appUserRepository;
    @Override
    public MyUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser user = appUserRepository.findByEmail(username);
        return new MyUserDetails(user);
    }
}
