package com.spring.medical_appointment.config;

import com.spring.medical_appointment.mapper.DoctorMapper;
import com.spring.medical_appointment.mapper.PatientMapper;
import org.mapstruct.factory.Mappers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public PatientMapper patientMapper() {
        return Mappers.getMapper(PatientMapper.class);
    }

    @Bean
    public DoctorMapper doctorMapper() {
        return Mappers.getMapper(DoctorMapper.class);
    }
}

