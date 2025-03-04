package com.spring.medical_appointment.service.user;

import com.spring.medical_appointment.exceptions.ResourceNotFoundException;
import com.spring.medical_appointment.mapper.DoctorMapper;
import com.spring.medical_appointment.mapper.PatientMapper;
import com.spring.medical_appointment.mapper.UserMapper;
import com.spring.medical_appointment.models.Role;
import com.spring.medical_appointment.models.UserEntity;
import org.springframework.context.ApplicationContext;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class UserRoleMapperFactory {

    private final Map<Role, UserMapper> roleToMapperMap;
    public UserRoleMapperFactory(ApplicationContext applicationContext) {
        this.roleToMapperMap = Map.of(
                Role.PATIENT, applicationContext.getBean(PatientMapper.class),
                Role.DOCTOR, applicationContext.getBean(DoctorMapper.class),
                Role.ADMIN, applicationContext.getBean(PatientMapper.class)
        );
    }

    public Object getMapper(Role role, UserEntity userEntity) throws ResourceNotFoundException{
        UserMapper userMapper = roleToMapperMap.get(role);
        if (userMapper == null) {
            throw new ResourceNotFoundException("No such role: " + role);
        }
        return userMapper.toDto(userEntity);
    }

    public Page<?> getMapper(Role role, Page<UserEntity> userEntities) throws ResourceNotFoundException {
        UserMapper userMapper = roleToMapperMap.get(role);
        if (userMapper == null) {
            throw new ResourceNotFoundException("No such role: " + role);
        }
        return userMapper.toDtoPage(userEntities);
    }
}
