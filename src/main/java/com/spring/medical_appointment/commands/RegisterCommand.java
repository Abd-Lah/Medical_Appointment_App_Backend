package com.spring.medical_appointment.commands;

import com.spring.medical_appointment.models.Role;
import com.spring.medical_appointment.models.UserEntity;
import lombok.Data;

@Data
public class RegisterCommand {

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String city;
    private Role role;

    public UserEntity toUserEntity() {
        return new UserEntity(
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
                city,
                role
        );
    }
}
