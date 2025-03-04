package com.spring.medical_appointment.commands;

import lombok.Data;

@Data
public class LoginCommand {
    private String email;
    private String password;
}
