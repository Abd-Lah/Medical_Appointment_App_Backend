package com.spring.demo_relationship.service.user;

import com.spring.demo_relationship.exceptions.ResourceNotFoundException;
import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.Role;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.repository.DoctorProfileRepository;
import com.spring.demo_relationship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

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
    public UserEntity updateProfile(UserEntity userEntity) {
        UserEntity existingUser = getCurrentUser();
        existingUser.updateProfile(userEntity);
        userRepository.save(userEntity);
        return existingUser;
    }

    @Override
    public DoctorProfile updateProfile(DoctorProfile doctorProfile) {
        UserEntity existingUser = getCurrentUser();
        DoctorProfile existingDoctorProfile = doctorProfileRepository.getDoctorProfileByDoctor(existingUser);
        existingDoctorProfile.updateDoctorProfile(doctorProfile);
        return doctorProfileRepository.save(existingDoctorProfile);
    }

    @Override
    public List<UserEntity> getAllUsersByRole(String role) {
        Role roleEnum = Role.valueOf(role.toUpperCase());
        return userRepository.findUsersByRole(roleEnum);
    }

    @Override
    public List<UserEntity> getAllDoctors(String firstName, String lastName, String city) {
        return userRepository.getDoctors(firstName,lastName,city);
    }

    @Override
    public UserEntity getDoctor(String id) {
        UserEntity doctor = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User with id : " + id + " not found"));
        if (doctor.getRole() == Role.DOCTOR) {
            return doctor;
        }
        return null;
    }

    @Override
    public UserEntity getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String email = userDetails.getUsername();
        return getProfile(email);
    }
}
