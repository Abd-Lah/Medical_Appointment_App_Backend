package com.spring.demo_relationship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDto {
    private Integer id;
    private String name;
    private String email;
    private String phone;
    private List<AppointmentDto> appointments;

}
