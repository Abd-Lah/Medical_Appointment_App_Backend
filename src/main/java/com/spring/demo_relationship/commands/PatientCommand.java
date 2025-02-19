package com.spring.demo_relationship.commands;

import com.spring.demo_relationship.model.Patient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientCommand {

    private Integer id;
    private String name;
    private String email;
    private String phone;

}
