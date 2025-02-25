package com.spring.demo_relationship.mapper;

import com.spring.demo_relationship.dto.UserDto;
import com.spring.demo_relationship.models.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserDto toUserDto(UserEntity userEntity);
    UserEntity toUserEntity(UserDto userDto);
    List<UserDto> toUserDtoList(List<UserEntity> userEntities);
}
