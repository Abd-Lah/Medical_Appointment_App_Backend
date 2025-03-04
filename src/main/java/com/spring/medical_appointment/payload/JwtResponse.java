package com.spring.medical_appointment.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class JwtResponse {

    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String token;
    private String role;

}
