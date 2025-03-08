package com.spring.medical_appointment.dto;

import com.spring.medical_appointment.models.AppointmentStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AppointmentDoctorDto {

    private String id;

    private PatientDto patient;

    private LocalDateTime appointmentDate;

    private AppointmentStatus status;

    private ReportDto report;

}
