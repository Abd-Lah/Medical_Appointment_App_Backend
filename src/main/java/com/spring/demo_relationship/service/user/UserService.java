package com.spring.demo_relationship.service.user;

import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.UserEntity;

import java.util.List;

public interface UserService {
    UserEntity getProfile(String id);
    UserEntity updateProfile(UserEntity userEntity);
    DoctorProfile updateProfile(DoctorProfile doctorProfile);
    List<UserEntity> getAllUsersByRole(String role);
}
