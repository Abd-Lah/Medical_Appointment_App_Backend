package com.spring.demo_relationship.controller.user;

import com.spring.demo_relationship.dto.DoctorDto;
import com.spring.demo_relationship.mapper.DoctorMapper;
import com.spring.demo_relationship.mapper.PatientMapper;
import com.spring.demo_relationship.models.Role;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/user")
    public ResponseEntity<Object> user() {
        UserEntity user = userService.getCurrentUser();
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.PATIENT) {
            return new ResponseEntity<>(PatientMapper.INSTANCE.toPatientDto(user), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(DoctorMapper.INSTANCE.toDoctorDto(user), HttpStatus.OK);
        }
    }

    @GetMapping("/all/{search}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<?>> users(@PathVariable String search, Pageable pageable) {
        Page<UserEntity> users = userService.getAllUsersByRole(search, pageable);
        if(search.equals("doctor")){
            return new ResponseEntity<>(DoctorMapper.INSTANCE.toDoctorDtoPage(users), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(PatientMapper.INSTANCE.toDoctorDtoPage(users), HttpStatus.OK);
        }
    }
    @GetMapping("/all_doctors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<Page<DoctorDto>> doctors(Pageable pageable) {
        Page<UserEntity> users = userService.getAllUsersByRole("DOCTOR", pageable);
        return new ResponseEntity<>(DoctorMapper.INSTANCE.toDoctorDtoPage(users), HttpStatus.OK);
    }

    @GetMapping("/doctors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<Page<DoctorDto>> doctor(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String specialization,
            Pageable pageable) {

        Page<UserEntity> usersPage = userService.getAllDoctors(firstName, lastName, city, specialization, pageable);

        return new ResponseEntity<>(DoctorMapper.INSTANCE.toDoctorDtoPage(usersPage), HttpStatus.OK);
    }


    @GetMapping("/doctor/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<DoctorDto> doctor(@PathVariable String id) {
        UserEntity user = userService.getDoctor(id);
        return new ResponseEntity<>(DoctorMapper.INSTANCE.toDoctorDto(user), HttpStatus.OK);
    }

}
