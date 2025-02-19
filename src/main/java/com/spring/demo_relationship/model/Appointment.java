package com.spring.demo_relationship.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private LocalDateTime date_app;
    @JsonBackReference
    @ManyToOne
    private Patient patient;
    @JsonBackReference
    @ManyToOne
    private Medcin medcin;
    @JsonManagedReference
    @OneToOne
    private Consultation consultation;
}
