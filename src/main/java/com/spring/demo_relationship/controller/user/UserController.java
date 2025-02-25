package com.spring.demo_relationship.controller.user;

import com.spring.demo_relationship.dto.DoctorDto;
import com.spring.demo_relationship.dto.UserDto;
import com.spring.demo_relationship.mapper.DoctorMapper;
import com.spring.demo_relationship.mapper.UserMapper;
import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/user")
    public ResponseEntity<UserDto> user() {
        UserEntity user = userService.getCurrentUser();
        return new ResponseEntity<>(UserMapper.INSTANCE.toUserDto(user), HttpStatus.OK);
    }

    @GetMapping("/all/{search}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> users(@PathVariable String search) {
        List<UserEntity> users = userService.getAllUsersByRole(search);
        return new ResponseEntity<>(UserMapper.INSTANCE.toUserDtoList(users), HttpStatus.OK);
    }
    @GetMapping("/all_doctors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<List<UserDto>> doctors() {
        List<UserEntity> users = userService.getAllUsersByRole("DOCTOR");
        return new ResponseEntity<>(UserMapper.INSTANCE.toUserDtoList(users), HttpStatus.OK);
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<List<UserDto>> doctor(@RequestParam String firstName, @RequestParam String lastName, @RequestParam String city) {
        List<UserEntity> users = userService.getAllDoctors(firstName, lastName, city);
        return new ResponseEntity<>(UserMapper.INSTANCE.toUserDtoList(users), HttpStatus.OK);
    }

    @GetMapping("/doctor/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<DoctorDto> doctor(@PathVariable String id) {
        UserEntity user = userService.getDoctor(id);
        return new ResponseEntity<>(DoctorMapper.INSTANCE.doctorToDoctorDTO(user,user.getDoctorProfile()), HttpStatus.OK);
    }

}
