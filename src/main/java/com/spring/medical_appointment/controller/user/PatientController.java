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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {
    private final PatientService patientService;

    @GetMapping("/appointment")
    public ResponseEntity<Page<AppointmentDto>> getMyAppointment(Pageable pageable,@RequestParam(name="order", defaultValue = "desc") String orderBy) {
        Page<AppointmentEntity> myAppointment = patientService.getMyAppointment(pageable ,orderBy);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDtoPage(myAppointment), HttpStatus.OK);
    }

    @GetMapping("/billing_url/{appointmentId}")
    public ResponseEntity<Resource> appointmentBill(@PathVariable String appointmentId) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)  // Set content type as PDF
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" +"Appointment"+ "\"")  // Display inline
                .body(patientService.getMyAppointmentBill(appointmentId));
    }

    @GetMapping("/billing-test")
    public ResponseEntity<?> billingTest() {
        try {
            String billingDir = System.getProperty("user.home") + "/appointment_bills";
            java.io.File dir = new java.io.File(billingDir);
            
            if (!dir.exists()) {
                return ResponseEntity.ok(Map.of(
                    "message", "Billing directory does not exist",
                    "path", billingDir,
                    "exists", false
                ));
            }
            
            java.io.File[] files = dir.listFiles();
            List<String> fileNames = new ArrayList<>();
            if (files != null) {
                for (java.io.File file : files) {
                    fileNames.add(file.getName());
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "message", "Billing directory exists",
                "path", billingDir,
                "exists", true,
                "files", fileNames,
                "fileCount", fileNames.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "message", "Error checking billing directory",
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/appointment")
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

    @PostMapping("/regenerate-bill/{appointmentId}")
    public ResponseEntity<?> regenerateBill(@PathVariable String appointmentId) {
        try {
            patientService.regenerateBill(appointmentId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Bill regenerated successfully",
                "appointmentId", appointmentId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Failed to regenerate bill",
                "error", e.getMessage()
            ));
        }
    }

}
