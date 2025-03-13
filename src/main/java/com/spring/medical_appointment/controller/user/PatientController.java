package com.spring.medical_appointment.controller.user;

import com.spring.medical_appointment.commands.AppointmentCommand;
import com.spring.medical_appointment.dto.AppointmentDto;
import com.spring.medical_appointment.mapper.AppointmentMapper;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.service.patient.PatientService;
import jakarta.validation.Path;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;

@RestController
@RequestMapping("/patient/appointment")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {
    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<Page<AppointmentDto>> getMyAppointment(Pageable pageable,@RequestParam(name="order", defaultValue = "desc") String orderBy) {
        Page<AppointmentEntity> myAppointment = patientService.getMyAppointment(pageable ,orderBy);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDtoPage(myAppointment), HttpStatus.OK);
    }

    @GetMapping("/billing_url/{filename}")
    public ResponseEntity<Resource> appointmentBill(@PathVariable String filename) {

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)  // Set content type as PDF
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" +"Appointment"+ "\"")  // Display inline
                .body(patientService.getMyAppointmentBill(filename));
    }

    @PostMapping
    public ResponseEntity<AppointmentDto> makeAppointment(@Valid @RequestBody AppointmentCommand appointmentCommand){
        AppointmentEntity newAppointment = patientService.makeAppointment(appointmentCommand);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDto(newAppointment), HttpStatus.CREATED);
    }

    @PutMapping(path = "/{appointmentID}")
    public ResponseEntity<AppointmentDto> updateAppointment(@Valid @RequestBody AppointmentCommand appointmentCommand, @PathVariable(name = "appointmentID") String appointmentId){
        AppointmentEntity updatedAppointment = patientService.updateAppointment(appointmentCommand, appointmentId);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDto(updatedAppointment), HttpStatus.OK);
    }

    @DeleteMapping(path = "/{appointmentId}")
    public ResponseEntity<HashMap<String, String>> deleteAppointment(@PathVariable String appointmentId){
        patientService.cancelAppointment(appointmentId);
        HashMap<String, String> response = new HashMap<>();
        response.put("message", "Appointment cancelled successfully");
        return new ResponseEntity<>(response,HttpStatus.OK);
    }


}
