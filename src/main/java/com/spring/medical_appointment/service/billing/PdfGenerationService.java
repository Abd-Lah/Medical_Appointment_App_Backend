package com.spring.medical_appointment.service.billing;
import com.itextpdf.html2pdf.HtmlConverter;
import com.spring.medical_appointment.mapper.AppointmentMapper;
import com.spring.medical_appointment.mapper.PatientMapper;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.AppointmentStatus;
import com.spring.medical_appointment.models.Role;
import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.service.user.UserService;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class PdfGenerationService {

    private final Configuration freeMarkerConfig;
    private final EmailService emailService;
    private final UserService userService;

    @Value("${app.billing.dir:${user.home}/appointment_bills}")
    private String pdfStoragePath;

    @Async
    public CompletableFuture<Void> generateAndSavePdfAsync(AppointmentEntity appointment, UserEntity patient) throws IOException {
        System.out.println("=== BILL GENERATION STARTED ===");
        System.out.println("Appointment ID: " + appointment.getId());
        System.out.println("Appointment Status: " + appointment.getStatus());
        System.out.println("Patient: " + patient.getFirstName() + " " + patient.getLastName());
        
        try {
            // Check if the appointment is cancelled. If cancelled, remove the existing file (if it exists)
            if(!checkIfAppointmentCancelled(appointment)){
                System.out.println("Appointment not cancelled, generating bill...");
                // Generate HTML content from FreeMarker template
               String htmlContent = getHtmlContent(appointment, patient);
                // Generate the file path
                File bill = getFile(appointment.getId());
                System.out.println("Bill file path: " + bill.getAbsolutePath());

                // Convert HTML to PDF using iText
                convertToPdf(bill, htmlContent);
                System.out.println("Bill generated successfully!");

                //Send Notification
                //if(userService.getCurrentUser().getRole() == Role.PATIENT){
                    emailService.sendEmail(patient.getEmail(), "Your Appointment", htmlContent);
                //}
            } else {
                System.out.println("Appointment is cancelled, skipping bill generation");
            }
        } catch (Exception e) {
            System.out.println("ERROR during bill generation: " + e.getMessage());
            e.printStackTrace();
        }
        
        System.out.println("=== BILL GENERATION COMPLETED ===");
        return CompletableFuture.completedFuture(null);  // Indicate completion
    }


    private boolean checkIfAppointmentCancelled(AppointmentEntity appointment) {
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            try {
                Path billingPath = Paths.get(pdfStoragePath);
                if (!Files.exists(billingPath)) {
                    Files.createDirectories(billingPath);
                }
                File existingPdf = new File(billingPath.toFile(), appointment.getId() + ".pdf");
                if (existingPdf.exists()) existingPdf.delete();
            } catch (IOException e) {
                // Log error but continue
            }
            
            if(appointment.getAppointmentDate().isAfter(LocalDateTime.now())){
                emailService.sendEmail(
                    appointment.getPatient().getEmail(),
                    "Appointment Cancelled",
                    "Your Appointment has been canceled by <strong>Dr "+appointment.getDoctor().getFirstName()+" "+appointment.getDoctor().getLastName()+"</strong>"
                );
            }
            return true;
        }
        return false;
    }


    private String getHtmlContent(AppointmentEntity appointment, UserEntity patient) {
        // Prepare data for the FreeMarker template
        Map<String, Object> model = new HashMap<>();
        // Add necessary data to the model
        model.put("appointment", AppointmentMapper.INSTANCE.ToAppointmentDto(appointment));
        model.put("doctor", appointment.getDoctor());
        model.put("doctorProfile", appointment.getDoctor().getDoctorProfile());
        model.put("patient", PatientMapper.INSTANCE.toDto(patient)); // Ensure patient is mapped to PatientDto
        // Get the FreeMarker template
        try{
            Template template = freeMarkerConfig.getTemplate("appointmentBilling.ftl");
            return FreeMarkerTemplateUtils.processTemplateIntoString(template, model);
        }catch (Exception e){
            throw new RuntimeException("Internal server error");
        }
    }

    private File getFile(String appointmentId) throws IOException {
        // Create directory if it doesn't exist
        Path billingPath = Paths.get(pdfStoragePath);
        if (!Files.exists(billingPath)) {
            Files.createDirectories(billingPath);
        }
        
        File file = new File(billingPath.toFile(), appointmentId + ".pdf");

        // If the file exists (it was already generated before), delete it before generating a new one
        if (file.exists()) {
            file.delete();  // Delete the existing file
        }
        return file;
    }

    private void convertToPdf(File bill, String htmlContent) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (FileOutputStream fileOutputStream = new FileOutputStream(bill)) {
            HtmlConverter.convertToPdf(htmlContent, outputStream);
            fileOutputStream.write(outputStream.toByteArray());
        }
    }
}
