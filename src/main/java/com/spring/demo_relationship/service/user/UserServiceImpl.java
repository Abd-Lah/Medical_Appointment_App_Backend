package com.spring.demo_relationship.service.user;

import com.spring.demo_relationship.dto.UserDto;
import com.spring.demo_relationship.exceptions.ResourceNotFoundException;
import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.repository.DoctorProfileRepository;
import com.spring.demo_relationship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    private final UserEntity existingUser = getCurrentUser();

    @Override
    public UserEntity getProfile(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User with email : " + email + " not found");
        }
        return user;

    }

    @Override
    public UserEntity updateProfile(UserEntity userEntity) {
        existingUser.updateProfile(userEntity);
        userRepository.save(userEntity);
        return existingUser;
    }

    @Override
    public DoctorProfile updateProfile(DoctorProfile doctorProfile) {
        DoctorProfile existingDoctorProfile = doctorProfileRepository.getDoctorProfileByDoctor(existingUser);
        existingDoctorProfile.updateDoctorProfile(doctorProfile);
        return doctorProfileRepository.save(existingDoctorProfile);
    }

    @Override
    public List<UserEntity> getAllUsersByRole(String role) {
        return List.of();
    }

    public UserEntity getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();

        String email = userDetails.getUsername();
        return getProfile(email);

    }
}
