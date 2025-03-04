package com.spring.medical_appointment.service.user;

import com.spring.medical_appointment.commands.DoctorProfileCommand;
import com.spring.medical_appointment.commands.UserCommand;
import com.spring.medical_appointment.models.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserEntity getCurrentUser();
    UserEntity updateProfile(UserCommand userCommand);
    UserEntity updateProfile(DoctorProfileCommand profile);
    Page<UserEntity> getAllUsersByRole(String role, Pageable pageable);

    Page<UserEntity> getAllDoctors(String firstName, String lastName, String city, String specialization, Pageable pageable);

    UserEntity getDoctor(String id);
}
