package com.spring.demo_relationship.service.user;

import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.repository.DoctorProfileRepository;
import com.spring.demo_relationship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @Override
    public UserEntity getProfile(String id) {
        return userRepository.findById(id).orElseThrow(new NotFoundException("User Not Found"));
    }

    @Override
    public UserEntity updateProfile(UserEntity userEntity) {
        return null;
    }

    @Override
    public DoctorProfile updateProfile(DoctorProfile doctorProfile) {
        return null;
    }

    @Override
    public List<UserEntity> getAllUsersByRole(String role) {
        return List.of();
    }
}
