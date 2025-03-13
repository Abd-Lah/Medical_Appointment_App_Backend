package com.spring.medical_appointment.mapper;


import com.spring.medical_appointment.config.AppConfig;
import com.spring.medical_appointment.dto.AppointmentDoctorDto;
import com.spring.medical_appointment.dto.AppointmentDto;
import com.spring.medical_appointment.models.AppointmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(uses = DoctorMapper.class)
public interface AppointmentMapper {

    AppointmentMapper INSTANCE = Mappers.getMapper(AppointmentMapper.class);

    @Mapping(source = "doctor", target = "doctor")
    @Mapping(source = "report", target = "report")
    @Mapping(target = "billUrl", expression = "java(generateBillingUrl(appointmentEntity))")
    AppointmentDto ToAppointmentDto(AppointmentEntity appointmentEntity);

    AppointmentDoctorDto ToAppointmentDoctorDto(AppointmentEntity appointmentEntity);

    default Page<AppointmentDto> ToAppointmentDtoPage(Page<AppointmentEntity> appointmentEntityPage) {
        List<AppointmentDto> appointmentDtoList = appointmentEntityPage.getContent().stream()
                .map(this::ToAppointmentDto)
                .collect(Collectors.toList());

        return new PageImpl<>(appointmentDtoList, appointmentEntityPage.getPageable(), appointmentEntityPage.getTotalElements());
    }

    default Page<AppointmentDoctorDto> ToAppointmentDocotorDtoPage(Page<AppointmentEntity> appointmentEntityPage) {
        List<AppointmentDoctorDto> appointmentDtoList = appointmentEntityPage.getContent().stream()
                .map(this::ToAppointmentDoctorDto)
                .collect(Collectors.toList());

        return new PageImpl<>(appointmentDtoList, appointmentEntityPage.getPageable(), appointmentEntityPage.getTotalElements());
    }

    default String generateBillingUrl(AppointmentEntity appointmentEntity) {
        String baseUrl = "http://localhost:8080";
        return baseUrl + "/patient/appointment/billing_url/" + appointmentEntity.getId();
    }

}

