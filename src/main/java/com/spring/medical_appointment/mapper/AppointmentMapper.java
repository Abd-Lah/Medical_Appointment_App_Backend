package com.spring.medical_appointment.mapper;


import com.spring.medical_appointment.dto.AppointmentDto;
import com.spring.medical_appointment.models.AppointmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface AppointmentMapper {

    AppointmentMapper INSTANCE = Mappers.getMapper(AppointmentMapper.class);

    @Mapping(source = "doctor", target = "doctor")
    @Mapping(source = "report", target = "report")
    AppointmentDto ToAppointmentDto(AppointmentEntity appointmentEntity);

    default Page<AppointmentDto> ToAppointmentDtoPage(Page<AppointmentEntity> appointmentEntityPage) {
        List<AppointmentDto> appointmentDtoList = appointmentEntityPage.getContent().stream()
                .map(this::ToAppointmentDto)
                .collect(Collectors.toList());

        return new PageImpl<>(appointmentDtoList, appointmentEntityPage.getPageable(), appointmentEntityPage.getTotalElements());
    }

}

