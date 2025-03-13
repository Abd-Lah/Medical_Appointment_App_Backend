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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import java.io.*;
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

    private final String pdfStoragePath = "/opt/appointment_medical_app/appointment_bills/";

    @Async
    public CompletableFuture<Void> generateAndSavePdfAsync(AppointmentEntity appointment, UserEntity patient) throws IOException {

        // Check if the appointment is cancelled. If cancelled, remove the existing file (if it exists)
        if(!checkIfAppointmentCancelled(appointment)){
            // Generate HTML content from FreeMarker template
           String htmlContent = getHtmlContent(appointment, patient);
            // Generate the file path
            File bill = getFile(appointment.getId());

            // Convert HTML to PDF using iText
            convertToPdf(bill, htmlContent);

            //Send Notification
            //if(userService.getCurrentUser().getRole() == Role.PATIENT){
                emailService.sendEmail(patient.getEmail(), "Your Appointment", htmlContent);
            //}
        }
        return CompletableFuture.completedFuture(null);  // Indicate completion
    }


    private boolean checkIfAppointmentCancelled(AppointmentEntity appointment) {
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            File existingPdf = new File(pdfStoragePath, appointment.getId() + ".pdf");
            if (existingPdf.exists()) existingPdf.delete();
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

    private File getFile(String appointmentId) {
        File file = new File(pdfStoragePath, appointmentId + ".pdf");

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
