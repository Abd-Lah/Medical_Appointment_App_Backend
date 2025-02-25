package com.spring.demo_relationship.mapper;

import com.spring.demo_relationship.dto.DoctorProfileDTO;
import com.spring.demo_relationship.models.DoctorProfile;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface DoctorProfileMapper {
    DoctorProfileMapper INSTANCE = Mappers.getMapper(DoctorProfileMapper.class);

    DoctorProfileDTO toDoctorProfileDto(DoctorProfile doctorProfile);
}
