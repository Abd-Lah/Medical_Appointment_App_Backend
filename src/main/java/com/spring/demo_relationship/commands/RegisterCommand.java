package com.spring.demo_relationship.commands;

import com.spring.demo_relationship.models.Role;
import com.spring.demo_relationship.models.UserEntity;
import lombok.Data;

@Data
public class RegisterCommand {

    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Role role;

    public UserEntity toUserEntity() {
        return new UserEntity(
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
                role
        );
    }
}
