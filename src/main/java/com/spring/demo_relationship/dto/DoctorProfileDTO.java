package com.spring.demo_relationship.dto;

import com.spring.demo_relationship.models.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorProfileDTO {
    private UserEntity doctor;

    private String bio;

    private String experience;

    private String qualifications;

    private String clinicAddress;

    private String specialty ;

    private Integer appointmentDuration ; // Default 30 minutes

    private String workingDays ;

    private String startTime ;

    private String breakTimeStart ;

    private String breakTimeEnd ;

    private String endTime ;
}
