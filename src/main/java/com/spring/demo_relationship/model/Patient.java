package com.spring.demo_relationship.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String email;
    private String phone;
    @JsonManagedReference
    @OneToMany (mappedBy = "patient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Appointment> appointments;
}
