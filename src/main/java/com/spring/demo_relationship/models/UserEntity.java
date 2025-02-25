package com.spring.demo_relationship.models;


import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity extends BaseEntity {

    @Column(unique=true, nullable=false)
    private String email;

    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;  // PATIENT, DOCTOR, ADMIN

    @OneToOne(mappedBy = "doctor", cascade = CascadeType.ALL ,fetch = FetchType.EAGER)
    private DoctorProfile doctorProfile;

    public UserEntity(String email, String password, String firstName, String lastName, String phoneNumber, Role role) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.role = role;
    }

    public UserEntity updateProfile(UserEntity userEntity) {
        userEntity.setFirstName(firstName);
        userEntity.setLastName(lastName);
        userEntity.setEmail(email);
        userEntity.setPhoneNumber(phoneNumber);
        userEntity.setRole(role);
        userEntity.setPassword(password);
        userEntity.setDoctorProfile(doctorProfile);
        return userEntity;
    }
}
