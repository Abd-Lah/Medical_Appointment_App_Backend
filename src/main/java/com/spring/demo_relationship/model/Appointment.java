package com.spring.demo_relationship.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
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
    @OneToOne
    private Consultation consultation;
}
