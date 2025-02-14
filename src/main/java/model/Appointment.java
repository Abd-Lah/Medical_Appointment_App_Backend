package model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
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

    public Appointment(LocalDateTime dateApp, Patient patient, Medcin doctor, Consultation consultation) {
        this.date_app = dateApp;
        this.patient = patient;
        this.medcin = doctor;
        this.consultation = consultation;
    }
}
