package com.spring.medical_appointment.models;

import com.spring.medical_appointment.config.AppConfig;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;


import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
public class AppointmentEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private UserEntity patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private UserEntity doctor;

    @Column(nullable = false, name = "appointment_date")
    private LocalDateTime appointmentDate;

    @Column(nullable = false)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private ReportEntity report;


    public AppointmentEntity(UserEntity loggedPatient, UserEntity doctor, LocalDateTime appointmentDate, AppointmentStatus appointmentStatus, ReportEntity report) {
        this.patient = loggedPatient;
        this.doctor = doctor;
        this.appointmentDate = appointmentDate;
        this.status = appointmentStatus;
        this.report = report;
    }
}

