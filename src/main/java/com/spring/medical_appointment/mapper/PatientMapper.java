package com.spring.medical_appointment.mapper;

import com.spring.medical_appointment.dto.PatientDto;
import com.spring.medical_appointment.models.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface PatientMapper extends UserMapper{
    PatientMapper INSTANCE = Mappers.getMapper(PatientMapper.class);

    PatientDto toDto(UserEntity userEntity);
    UserEntity toUserEntity(PatientDto userDto);
    // Add this method to map Page<UserEntity> to Page<UserDto>
    default Page<PatientDto> toDtoPage(Page<UserEntity> userEntitiesPage) {
        List<PatientDto> patientDtos = userEntitiesPage.getContent().stream()
                .map(this::toDto) // Map each UserEntity to UserDto
                .collect(Collectors.toList());

        return new PageImpl<>(patientDtos, userEntitiesPage.getPageable(), userEntitiesPage.getTotalElements());
    }
}

