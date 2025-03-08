package com.spring.medical_appointment.commands;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportCommand {

    @NotBlank
    @Size(min = 10)
    private String diagnosis;

    @NotBlank
    @Size(min = 10)
    private String treatment;

    @NotBlank
    @Size(min = 10)
    private String notes;

}
