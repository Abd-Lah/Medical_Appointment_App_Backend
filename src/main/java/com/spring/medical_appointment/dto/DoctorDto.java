package com.spring.medical_appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDto {

    private String id;

    private String email;

    private String firstName;

    private String lastName;

    private String city;

    private String phoneNumber;

    private DoctorProfileDTO doctorProfileDTO ;

    private String profilePictureUrl;

    // New: available slots by date (key: date string, value: list of available slots)
    private Map<String, List<String>> availableSlotsByDate;
}
