package com.spring.demo_relationship.commands;

import com.spring.demo_relationship.models.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentCommand {

    private String doctorId;

    private LocalDateTime appointmentDate;
}
