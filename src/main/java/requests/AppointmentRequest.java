package requests;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class AppointmentRequest {

    // Getters and Setters
    private int doctorId;
    private String appointmentDate; // The date-time string

}

