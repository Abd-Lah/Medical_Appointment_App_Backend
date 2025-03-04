package com.spring.medical_appointment.models;


import com.spring.medical_appointment.commands.UserCommand;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity extends BaseEntity {

    @Column(unique=true, nullable=false)
    private String email;

    @Column(nullable=false)
    private String password;

    @Column(name = "first_name", nullable=false)
    private String firstName;

    @Column(name = "last_name", nullable=false)
    private String lastName;

    @Column(name = "city", nullable=false)
    private String city;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;  // PATIENT, DOCTOR, ADMIN

    @OneToOne(mappedBy = "doctor", cascade = CascadeType.ALL ,fetch = FetchType.EAGER)
    private DoctorProfile doctorProfile;

    public UserEntity(String email, String password, String firstName, String lastName, String phoneNumber, String city, Role role) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.city = city;
        this.role = role;
    }

    public UserEntity updateUserProfile(UserCommand user) {
        this.setFirstName(user.getFirstName());
        this.setLastName(user.getLastName());
        this.setPhoneNumber(user.getPhone());
        this.setCity(user.getCity());
        return this;
    }
}
