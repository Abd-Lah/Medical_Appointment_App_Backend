package com.spring.medical_appointment.commands;

import com.spring.medical_appointment.models.AppointmentStatus;
import jakarta.validation.ValidationException;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentStatusCommand {

    private String status;

    public AppointmentStatus validate() {
        if (status == null || status.isEmpty()) {
            throw new ValidationException("Status is required");
        }
        if(!status.equalsIgnoreCase("pending") && !status.equalsIgnoreCase("approved") && !status.equalsIgnoreCase("cancelled")){
            throw new ValidationException("Status must be 'pending' or 'approved' or 'cancelled'");
        }
        return AppointmentStatus.valueOf(status.toUpperCase());
    }
}
