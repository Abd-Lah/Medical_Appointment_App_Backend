package com.spring.medical_appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorProfileDTO {

    private String bio;

    private String experience;

    private String qualifications;

    private String clinicAddress;

    private String specialty ;

    private Integer appointmentDuration ;

    private String workingDays ;

    private String startTime ;

    private String breakTimeStart ;

    private String breakTimeEnd ;

    private String endTime ;
}
