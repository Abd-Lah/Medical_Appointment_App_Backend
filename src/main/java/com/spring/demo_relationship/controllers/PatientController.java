package com.spring.demo_relationship.controllers;

import com.spring.demo_relationship.commands.PatientCommand;
import com.spring.demo_relationship.dto.AppointmentDto;
import com.spring.demo_relationship.dto.PatientDto;
import com.spring.demo_relationship.model.Medcin;
import com.spring.demo_relationship.model.Patient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.spring.demo_relationship.commands.AppointmentCommand;
import com.spring.demo_relationship.service.imp.MedecinServiceImp;
import com.spring.demo_relationship.service.imp.PatientServiceImp;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientServiceImp patientService;
    private final MedecinServiceImp medecinService;

    public PatientController(PatientServiceImp patientService, MedecinServiceImp medecinService) {
        this.patientService = patientService;
        this.medecinService = medecinService;
    }

    @GetMapping
    public List<PatientDto> getPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable int id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @PostMapping
    public ResponseEntity<PatientDto> addPatient(@RequestBody Patient patient) {
        PatientDto newPatient = patientService.createPatient(patient);
        return new ResponseEntity<>(newPatient, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> updatePatient(@PathVariable int id, @RequestBody PatientCommand patient) {
        PatientDto updatedPatient = patientService.updatePatient(id, patient);
        return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable int id) {
        patientService.deletePatient(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{patientId}/appointments")
    public ResponseEntity<AppointmentDto> makeAppointment(
            @PathVariable int patientId,
            @RequestBody AppointmentCommand appointmentRequest) {

        // Verify patient existence
        Patient patient = patientService.getById(patientId);

        // Verify doctor existence
        Medcin doctor = medecinService.getMedecinById(appointmentRequest.getDoctorId());

        // Parse the date and time from the string
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime parsedDate = LocalDateTime.parse(appointmentRequest.getAppointmentDate(), formatter);

        // Create and save the appointment
        AppointmentDto appointment = patientService.makeAppointment(patient, doctor, parsedDate);

        return new ResponseEntity<>(appointment, HttpStatus.CREATED);
    }


}
