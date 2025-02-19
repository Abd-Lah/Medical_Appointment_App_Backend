package com.spring.demo_relationship.commands;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AppointmentCommand {

    private int doctorId;
    private String appointmentDate;

}

