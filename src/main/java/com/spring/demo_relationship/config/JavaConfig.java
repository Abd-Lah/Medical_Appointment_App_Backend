package com.spring.demo_relationship.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

import java.util.Optional;

@Configuration
public class JavaConfig {

    @Bean
    public AuditorAware<String> auditorProvider(){
        return () -> Optional.of("APPOINTMENT_AUDITOR");
    }
}
