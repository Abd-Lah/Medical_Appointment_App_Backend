package com.spring.demo_relationship.dto;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.spring.demo_relationship.model.Consultation;
import com.spring.demo_relationship.model.Medcin;
import com.spring.demo_relationship.model.Patient;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDto {
    private Integer id;
    private LocalDateTime date_app;
    private Patient patient;
    private Medcin medcin;
    private Consultation consultation;

}
