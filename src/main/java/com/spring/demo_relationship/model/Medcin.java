package com.spring.demo_relationship.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Medcin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String email;
    private String phone;
    private String specialize;
    @JsonManagedReference
    @OneToMany (mappedBy = "medcin", fetch = FetchType.EAGER)
    private List<Appointment> appointments;

}
