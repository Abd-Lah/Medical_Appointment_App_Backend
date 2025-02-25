package com.spring.demo_relationship.mapper;

import com.spring.demo_relationship.dto.DoctorDto;
import com.spring.demo_relationship.dto.DoctorProfileDTO;
import com.spring.demo_relationship.dto.UserDto;
import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface DoctorMapper {
    // Static reference to the Mapper instance
    DoctorMapper INSTANCE = Mappers.getMapper(DoctorMapper.class);

    // Mapping from User entity to UserDTO
    UserDto userToUserDTO(UserEntity user);

    // Mapping from DoctorProfile entity to DoctorProfileDTO
    DoctorProfileDTO doctorProfileToDoctorProfileDTO(DoctorProfile doctorProfile);

    // Mapping from UserEntity and DoctorProfile to DoctorDto (composing both)
    @Mapping(source = "user", target = "user")  // Mapping from "user" to "user" field in DoctorDto
    @Mapping(source = "doctorProfile", target = "profile")  // Mapping from "doctorProfile" to "doctorProfile" field in DoctorDto
    DoctorDto doctorToDoctorDTO(UserEntity user, DoctorProfile doctorProfile);
}



