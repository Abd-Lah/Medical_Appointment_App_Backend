package com.spring.demo_relationship.mapper;

import com.spring.demo_relationship.dto.PatientDto;
import com.spring.demo_relationship.models.UserEntity;
import org.springframework.data.domain.Page;


public interface UserMapper {
    Object toDto(UserEntity userEntity);
    Page<?> toDtoPage(Page<UserEntity> userEntity);
}