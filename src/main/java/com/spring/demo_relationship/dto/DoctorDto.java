package com.spring.demo_relationship.dto;

import com.spring.demo_relationship.model.Appointment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {
    private String id;
    private String name;
    private String email;
    private String specialized;
    private String phone;
    private Collection<AppointmentDto> appointments;
}
