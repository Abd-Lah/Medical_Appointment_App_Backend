package com.spring.medical_appointment.commands;

import com.spring.medical_appointment.dto.DoctorProfileDTO;
import com.spring.medical_appointment.exceptions.ValidationException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentCommand {

    private String doctorId;
    private LocalDateTime appointmentDate;

    /*
        1/ Throws a ValidationException if the appointment is already booked.
        2/ Checks if the appointment is at least 30 minutes after the current time: Ensures the user cannot book an appointment immediately.
        3/ Ensures the appointment is scheduled for today or a future date.
        4/ Validates that the selected day is part of the doctor's working days.
        5/ Ensures the selected time falls within the doctor's available working hours and is not during a break.
    */
    public void validate(DoctorProfileDTO doctorProfileDTO ,Boolean alreadyTaken) throws ValidationException {

        LocalDateTime now = LocalDateTime.now().plusMinutes(30);


        String workingDays = doctorProfileDTO.getWorkingDays();
        LocalTime startTime = LocalTime.parse(doctorProfileDTO.getStartTime());
        LocalTime endTime = LocalTime.parse(doctorProfileDTO.getEndTime());
        int appointmentDuration = doctorProfileDTO.getAppointmentDuration();
        LocalTime breakStartTime = LocalTime.parse(doctorProfileDTO.getBreakTimeStart());
        LocalTime breakEndTime = LocalTime.parse(doctorProfileDTO.getBreakTimeEnd());

        if(alreadyTaken) {
            throw new ValidationException("Appointment already taken.");
        }
        if (appointmentDate.isBefore(now)) {
            throw new ValidationException("Appointment cannot be booked . It must be at least 30 minutes after the current time.");
        }

        if (appointmentDate.toLocalDate().isBefore(LocalDate.now())) {
            throw new ValidationException("Appointment date cannot be in the past.");
        }

        if (!isWorkingDay(appointmentDate, workingDays)) {
            throw new ValidationException("The selected date is not a working day for the doctor.");
        }

        String appointmentTime = appointmentDate.toLocalTime().toString();
        List<String> availableTimes = generateAvailableTimes(startTime, endTime, breakStartTime, breakEndTime, appointmentDuration);

        if (!availableTimes.contains(appointmentTime)) {
            throw new ValidationException("The selected time is outside the available working hours or during a break.");
        }
    }

    private boolean isWorkingDay(LocalDateTime appointmentDate, String workingDays) {
        DayOfWeek dayOfWeek = appointmentDate.getDayOfWeek();

        List<String> workingDayList = Arrays.asList(workingDays.toLowerCase().split(","));

        return workingDayList.contains(dayOfWeek.toString().toLowerCase());
    }

    private List<String> generateAvailableTimes(LocalTime startTime, LocalTime endTime, LocalTime breakStartTime, LocalTime breakEndTime, int appointmentDuration) {
        List<String> availableTimes = new ArrayList<>();
        LocalTime currentTime = startTime;

        while (!currentTime.isAfter(endTime.minusMinutes(appointmentDuration))) { // Ensure there's enough time for appointment duration
            if (currentTime.isBefore(breakStartTime) || currentTime.isAfter(breakEndTime)) {
                availableTimes.add(currentTime.toString());
            }
            currentTime = currentTime.plusMinutes(appointmentDuration); // Increment by appointment duration
        }

        return availableTimes;
    }
}


