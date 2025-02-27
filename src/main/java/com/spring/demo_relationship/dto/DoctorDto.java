package com.spring.demo_relationship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {

    private String id;

    private String email;

    private String firstName;

    private String lastName;

    private String city;

    private String phoneNumber;

    private DoctorProfileDTO doctorProfileDTO ;
}
