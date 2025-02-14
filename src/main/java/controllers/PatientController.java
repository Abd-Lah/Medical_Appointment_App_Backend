package controllers;

import model.Appointment;
import model.Medcin;
import model.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import requests.AppointmentRequest;
import service.MedecinServiceImp;
import service.PatientServiceImp;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientServiceImp patientService;
    private final MedecinServiceImp medecinService;

    @Autowired
    public PatientController(PatientServiceImp patientService, MedecinServiceImp medecinService) {
        this.patientService = patientService;
        this.medecinService = medecinService;
    }

    @GetMapping
    public List<Patient> getPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable int id) {
        Patient patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @PostMapping
    public ResponseEntity<Patient> addPatient(@RequestBody Patient patient) {
        Patient newPatient = patientService.createPatient(patient);
        return new ResponseEntity<>(newPatient, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable int id, @RequestBody Patient patient) {
        Patient updatedPatient = patientService.updatePatient(id, patient);
        return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable int id) {
        patientService.deletePatient(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{patientId}/appointments")
    public ResponseEntity<Appointment> makeAppointment(
            @PathVariable int patientId,
            @RequestBody AppointmentRequest appointmentRequest) {

        // Verify patient existence
        Patient patient = patientService.getPatientById(patientId);

        // Verify doctor existence
        Medcin doctor = medecinService.getMedecinById(appointmentRequest.getDoctorId());

        // Parse the date and time from the string
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime parsedDate = LocalDateTime.parse(appointmentRequest.getAppointmentDate(), formatter);

        // Create and save the appointment
        Appointment appointment = patientService.makeAppointment(patient, doctor, parsedDate);

        return new ResponseEntity<>(appointment, HttpStatus.CREATED);
    }


}
