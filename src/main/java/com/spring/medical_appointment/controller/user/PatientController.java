package com.spring.medical_appointment.controller.user;

import com.spring.medical_appointment.commands.AppointmentCommand;
import com.spring.medical_appointment.dto.AppointmentDto;
import com.spring.medical_appointment.mapper.AppointmentMapper;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.service.patient.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/appointment")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {
    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<Page<AppointmentDto>> getMyAppointment(Pageable pageable,@RequestParam(name="order", defaultValue = "desc") String orderBy) {
        Page<AppointmentEntity> myAppointment = patientService.getMyAppointment(pageable ,orderBy);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDtoPage(myAppointment), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<AppointmentDto> makeAppointment(@Valid @RequestBody AppointmentCommand appointmentCommand){
        AppointmentEntity newAppointment = patientService.makeAppointment(appointmentCommand);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDto(newAppointment), HttpStatus.CREATED);
    }


}
