package com.spring.medical_appointment;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;



@EnableJpaAuditing
@SpringBootApplication
@EnableAsync
public class MedicalApp {
    public static void main(String[] args) {
        SpringApplication.run(MedicalApp.class, args);
    }

   @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }



}
