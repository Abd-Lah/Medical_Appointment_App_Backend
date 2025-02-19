package com.spring.demo_relationship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConsultationDto {
    private String id;
    private Date date;
    private String report;
    private AppointmentDto appointment;
}
