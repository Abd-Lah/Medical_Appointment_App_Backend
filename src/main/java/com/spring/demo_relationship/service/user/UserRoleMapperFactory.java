package com.spring.demo_relationship.service.user;

import com.spring.demo_relationship.exceptions.ResourceNotFoundException;
import com.spring.demo_relationship.mapper.DoctorMapper;
import com.spring.demo_relationship.mapper.PatientMapper;
import com.spring.demo_relationship.mapper.UserMapper;
import com.spring.demo_relationship.models.Role;
import com.spring.demo_relationship.models.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
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
