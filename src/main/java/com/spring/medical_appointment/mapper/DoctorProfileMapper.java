package com.spring.medical_appointment.mapper;

import com.spring.medical_appointment.dto.DoctorProfileDTO;
import com.spring.medical_appointment.models.DoctorProfile;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface DoctorProfileMapper {
    DoctorProfileMapper INSTANCE = Mappers.getMapper(DoctorProfileMapper.class);

    DoctorProfileDTO toDoctorProfileDto(DoctorProfile doctorProfile);
}
