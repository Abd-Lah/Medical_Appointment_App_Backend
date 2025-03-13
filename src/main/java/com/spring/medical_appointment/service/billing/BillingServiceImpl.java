package com.spring.medical_appointment.service.billing;

import com.spring.medical_appointment.exceptions.ResourceNotFoundException;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {
    private final PdfGenerationService pdfGenerationService;

    @Override
    public void appointmentBill(AppointmentEntity appointment, UserEntity user) {
        try {
            pdfGenerationService.generateAndSavePdfAsync(appointment, user);
        } catch(Exception e){
            throw new RuntimeException("Internal server error");
        }
    }

    @Override
    public Resource GetMyAppointmentBill(String filename) {
        String FILE_STORAGE_PATH = "/opt/appointment_medical_app/appointment_bills/";
        Path filePath = Paths.get(FILE_STORAGE_PATH).resolve(filename);  // Construct the full file path

        File file = filePath.toFile();

        if (!file.exists()) {
            throw new ResourceNotFoundException("File not found");
        }

        Resource resource = new FileSystemResource(file);

        // Check if resource exists
        if (!resource.exists()) {
            throw new ResourceNotFoundException("File not found");
        }

        return resource;

    }
}
