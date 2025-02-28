package com.spring.demo_relationship.controller.user;

import com.spring.demo_relationship.commands.AppointmentCommand;
import com.spring.demo_relationship.dto.AppointmentDto;
import com.spring.demo_relationship.mapper.AppointmentMapper;
import com.spring.demo_relationship.models.AppointmentEntity;
import com.spring.demo_relationship.service.patient.PatientService;
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
    public ResponseEntity<AppointmentDto> makeAppointment(@RequestBody AppointmentCommand appointmentCommand){
        AppointmentEntity newAppointment = patientService.makeAppointment(appointmentCommand);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDto(newAppointment), HttpStatus.CREATED);
    }
}
