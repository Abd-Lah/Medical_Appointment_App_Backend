package com.spring.demo_relationship.mapper;

import com.spring.demo_relationship.dto.DoctorDto;
import com.spring.demo_relationship.dto.PatientDto;
import com.spring.demo_relationship.models.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
public interface DoctorMapper extends UserMapper {
    DoctorMapper INSTANCE = Mappers.getMapper(DoctorMapper.class);

    @Override
    @Mapping(target = "doctorProfileDTO", source = "doctorProfile")
    DoctorDto toDto(UserEntity userEntity);
    UserEntity toUserEntity(DoctorDto userDto);
    // Add this method to map Page<UserEntity> to Page<UserDto>
    @Override
    @Mapping(target = "doctorProfileDTO", source = "doctorProfile")
    default Page<DoctorDto> toDtoPage(Page<UserEntity> userEntitiesPage) {
        List<DoctorDto> doctorDtos = userEntitiesPage.getContent().stream()
                .map(this::toDto) // Map each UserEntity to UserDto
                .collect(Collectors.toList());

        return new PageImpl<>(doctorDtos, userEntitiesPage.getPageable(), userEntitiesPage.getTotalElements());
    }
}
