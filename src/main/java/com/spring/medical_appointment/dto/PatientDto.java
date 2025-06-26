package com.spring.medical_appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDto {

    private String id;

    private String email;

    private String firstName;

    private String lastName;

    private String city;

    private String phoneNumber;

    private String profilePictureUrl;

}
