package com.spring.demo_relationship.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.spring.demo_relationship.commands.DoctorProfileCommand;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctor_profiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorProfile extends BaseEntity{
    @OneToOne
    @JoinColumn(name = "doctor_id", nullable = false, unique = true)
    @JsonIgnore
    private UserEntity doctor;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String experience;

    @Column(columnDefinition = "TEXT")
    private String qualifications;

    private String clinicAddress;

    @Column(nullable = false)
    private String specialty = "General";

    @Column(nullable = false)
    private Integer appointmentDuration = 30; // Default 30 minutes

    @Column(nullable = false)
    private String workingDays = "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday";

    @Column(nullable = false, name = "start_time")
    private String startTime = "09:00";

    @Column(nullable = false, name = "break_time_start")
    private String breakTimeStart = "13:00";

    @Column(nullable = false, name = "break_time_end")
    private String breakTimeEnd = "14:00";

    @Column(nullable = false, name = "end_time")
    private String endTime = "22:00";

    public DoctorProfile(UserEntity user) {
        this.doctor = user;
    }

    public DoctorProfile updateDoctorProfile(DoctorProfileCommand p) {
        this.setBio(p.getBio());
        this.setExperience(p.getExperience());
        this.setQualifications(p.getQualifications());
        this.setClinicAddress(p.getClinicAddress());
        this.setSpecialty(p.getSpecialty());
        this.setAppointmentDuration(p.getAppointmentDuration());
        this.setWorkingDays(p.getWorkingDays());
        this.setStartTime(p.getStartTime());
        this.setBreakTimeStart(p.getBreakTimeStart());
        this.setBreakTimeEnd(p.getBreakTimeEnd());
        this.setEndTime(p.getEndTime());
        return this;
    }
}
