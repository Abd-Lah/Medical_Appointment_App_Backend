package com.spring.medical_appointment.service.billing;
import com.itextpdf.html2pdf.HtmlConverter;
import com.spring.medical_appointment.mapper.AppointmentMapper;
import com.spring.medical_appointment.mapper.PatientMapper;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.AppointmentStatus;
import com.spring.medical_appointment.models.UserEntity;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.ui.freemarker.FreeMarkerTemplateUtils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class PdfGenerationService {

    private final Configuration freeMarkerConfig;
    private final EmailService emailService;

    // Local directory where PDFs will be stored
    private final String pdfStoragePath = "/opt/appointment_medical_app/appointment_bills/";

    @Async  // This will make the PDF creation run asynchronously
    public CompletableFuture<Void> generateAndSavePdfAsync(AppointmentEntity appointment, UserEntity patient) throws IOException, TemplateException {

        // Check if the appointment is cancelled. If cancelled, remove the existing file (if it exists)
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            File existingPdf = new File(pdfStoragePath, appointment.getId() + ".pdf");
            if (existingPdf.exists()) {
                existingPdf.delete();
            }
            return CompletableFuture.completedFuture(null);  // No further action needed
        }

        // Prepare data for the FreeMarker template
        Map<String, Object> model = new HashMap<>();

        // Add necessary data to the model
        model.put("appointment", AppointmentMapper.INSTANCE.ToAppointmentDto(appointment));
        model.put("doctor", appointment.getDoctor());
        model.put("doctorProfile", appointment.getDoctor().getDoctorProfile());
        model.put("patient", PatientMapper.INSTANCE.toDto(patient)); // Ensure patient is mapped to PatientDto

        // Get the FreeMarker template
        Template template = freeMarkerConfig.getTemplate("appointmentBilling.ftl");

        // Generate HTML content from FreeMarker template
        String htmlContent = FreeMarkerTemplateUtils.processTemplateIntoString(template, model);

        // Generate the file path
        File file = new File(pdfStoragePath, appointment.getId() + ".pdf");

        // If the file exists (it was already generated before), delete it before generating a new one
        if (file.exists()) {
            file.delete();  // Delete the existing file
        }

        // Convert HTML to PDF using iText
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try (FileOutputStream fileOutputStream = new FileOutputStream(file)) {
            HtmlConverter.convertToPdf(htmlContent, outputStream);
            fileOutputStream.write(outputStream.toByteArray());
        }
        emailService.sendEmailWithAttachment(
                patient.getEmail(),
                "Your Appointment",
                htmlContent,
                file
        );
        return CompletableFuture.completedFuture(null);  // Indicate completion
    }
}
