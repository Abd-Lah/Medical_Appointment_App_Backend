package com.spring.demo_relationship.service.user;

import com.spring.demo_relationship.commands.DoctorProfileCommand;
import com.spring.demo_relationship.commands.UserCommand;
import com.spring.demo_relationship.exceptions.ResourceNotFoundException;
import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.Role;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.repository.DoctorProfileRepository;
import com.spring.demo_relationship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;


    private UserEntity getProfile(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User with email : " + email + " not found");
        }
        return user;

    }

    @Override
    @Transactional
    public UserEntity updateProfile(UserCommand userCommand) {
        UserEntity existingUser = getCurrentUser();
        existingUser.updateUserProfile(userCommand);
        userRepository.save(existingUser);
        return existingUser;
    }

    @Override
    @Transactional
    public UserEntity updateProfile(DoctorProfileCommand profile) {
        UserEntity existingUser = getCurrentUser();
        DoctorProfile existingDoctorProfile = existingUser.getDoctorProfile();
        existingDoctorProfile.updateDoctorProfile(profile);
        doctorProfileRepository.save(existingDoctorProfile);
        return existingUser;
    }

    @Override
    public Page<UserEntity> getAllUsersByRole(String role, Pageable pageable) {
        Role roleEnum = Role.valueOf(role.toUpperCase());
        return userRepository.findUsersByRole(roleEnum, pageable);
    }

    @Override
    public Page<UserEntity> getAllDoctors(String firstName, String lastName, String city, String specialization, Pageable pageable) {
        return userRepository.getDoctors(firstName, lastName, city, specialization, pageable);
    }


    @Override
    public UserEntity getDoctor(String id) {
        UserEntity doctor = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User with id : " + id + " not found"));
        if (doctor.getRole() == Role.DOCTOR) {
            return doctor;
        }else{
            throw new ResourceNotFoundException("Doctor with id : " + id + " not found");
        }
    }

    @Override
    public UserEntity getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String email = userDetails.getUsername();
        return getProfile(email);
    }
}
