package com.spring.demo_relationship.dto;

import com.spring.demo_relationship.models.Role;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private String id;

    private String email;

    private String password;

    private String firstName;

    private String lastName;

    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;
}
