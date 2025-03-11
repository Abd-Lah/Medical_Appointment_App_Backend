package com.spring.medical_appointment;

import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.repository.AppointmentRepository;
import com.spring.medical_appointment.repository.UserRepository;
import com.spring.medical_appointment.service.billing.EmailService;
import com.spring.medical_appointment.service.billing.PdfGenerationService;
import freemarker.template.Configuration;
import jakarta.mail.internet.MimeMessage;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.InputStream;


@EnableJpaAuditing
@SpringBootApplication
@EnableAsync
public class DemoRelationshipApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoRelationshipApplication.class, args);
    }

   @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



}
