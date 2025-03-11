package com.spring.medical_appointment.service.billing;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender emailSender;

    @Async
    public void sendEmailWithAttachment(String toEmail, String subject, String htmlBody, File pdfFile) {
        try {
            // Create a MimeMessage
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // Set email properties
            helper.setTo(toEmail);
            helper.setSubject(subject);

            // Set the body as HTML content
            helper.setText(htmlBody, true); // true indicates that the body is HTML

            // Set "From" address
            helper.setFrom("no_replay@medical.appointment.com");

            // Add attachment
            helper.addAttachment("appointment.pdf", pdfFile);

            // Send the email
            emailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Failed to create the email message", e);
        } catch (MailException e) {
            throw new RuntimeException("Failed to send the email", e);
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error occurred while sending email", e);
        }
    }

}