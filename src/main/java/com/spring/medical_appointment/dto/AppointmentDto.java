package com.spring.medical_appointment.dto;

import com.spring.medical_appointment.models.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {

    private String id;

    private DoctorDto doctor;

    private LocalDateTime appointmentDate;

    private AppointmentStatus status;

    private ReportDto report;

}
