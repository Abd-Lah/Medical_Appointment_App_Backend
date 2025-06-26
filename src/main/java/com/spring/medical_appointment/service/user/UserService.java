package com.spring.medical_appointment.service.user;

import com.spring.medical_appointment.commands.ChangePasswordCommand;
import com.spring.medical_appointment.commands.DeleteAccountCommand;
import com.spring.medical_appointment.commands.DoctorProfileCommand;
import com.spring.medical_appointment.commands.UserCommand;
import com.spring.medical_appointment.models.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserEntity getCurrentUser();
    UserEntity updateProfile(UserCommand userCommand);
    UserEntity updateProfile(DoctorProfileCommand profile);
    UserEntity updateProfilePicture(String profilePictureUrl);
    Page<UserEntity> getAllUsersByRole(String role, Pageable pageable);

    Page<UserEntity> getAllDoctors(String firstName, String lastName, String city, String specialization, Pageable pageable);

    UserEntity getDoctor(String id);
    
    List<String> getAvailableSlots(String doctorId, String date);
    
    // New methods for password change and account deletion
    void changePassword(ChangePasswordCommand command);
    void deleteAccount(DeleteAccountCommand command);
}
