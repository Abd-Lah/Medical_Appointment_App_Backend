package com.spring.medical_appointment.mapper;

import com.spring.medical_appointment.models.UserEntity;
import org.springframework.data.domain.Page;


public interface UserMapper {
    Object toDto(UserEntity userEntity);
    Page<?> toDtoPage(Page<UserEntity> userEntity);
}