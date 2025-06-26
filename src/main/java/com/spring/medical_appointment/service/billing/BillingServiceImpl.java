package com.spring.medical_appointment.service.billing;

import com.spring.medical_appointment.exceptions.ResourceNotFoundException;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {
    private final PdfGenerationService pdfGenerationService;

    @Value("${app.billing.dir:${user.home}/appointment_bills}")
    private String billingDir;

    @Override
    public void appointmentBill(AppointmentEntity appointment, UserEntity user) {
        System.out.println("=== BILLING SERVICE CALLED ===");
        System.out.println("Appointment ID: " + appointment.getId());
        System.out.println("User: " + user.getFirstName() + " " + user.getLastName());
        
        try {
            pdfGenerationService.generateAndSavePdfAsync(appointment, user);
            System.out.println("PDF generation service called successfully");
        } catch(Exception e){
            System.out.println("ERROR in billing service: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Internal server error");
        }
    }

    @Override
    public Resource GetMyAppointmentBill(String filename) {
        try {
            // Create directory if it doesn't exist
            Path billingPath = Paths.get(billingDir);
            if (!Files.exists(billingPath)) {
                Files.createDirectories(billingPath);
            }
            
            Path filePath = billingPath.resolve(filename);  // Construct the full file path
            File file = filePath.toFile();

            if (!file.exists()) {
                throw new ResourceNotFoundException("Bill file not found: " + filename);
            }

            Resource resource = new FileSystemResource(file);

            // Check if resource exists
            if (!resource.exists()) {
                throw new ResourceNotFoundException("Bill file not found: " + filename);
            }

            return resource;
        } catch (Exception e) {
            throw new ResourceNotFoundException("Error accessing bill file: " + e.getMessage());
        }
    }
}
