package com.spring.demo_relationship.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "users")
@Data
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
}
