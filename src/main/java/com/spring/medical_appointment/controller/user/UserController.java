package com.spring.medical_appointment.controller.user;

import com.spring.medical_appointment.commands.ChangePasswordCommand;
import com.spring.medical_appointment.commands.DeleteAccountCommand;
import com.spring.medical_appointment.commands.DoctorProfileCommand;
import com.spring.medical_appointment.commands.UserCommand;
import com.spring.medical_appointment.dto.DoctorDto;
import com.spring.medical_appointment.mapper.DoctorMapper;
import com.spring.medical_appointment.models.Role;
import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.service.user.UserRoleMapperFactory;
import com.spring.medical_appointment.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final UserRoleMapperFactory userRoleMapperFactory;

    @GetMapping("/user")
    public ResponseEntity<Object> user() {
        UserEntity user = userService.getCurrentUser();
        Object dto = userRoleMapperFactory.getMapper(user.getRole(), user);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/all/{search}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<?>> users(@PathVariable String search, Pageable pageable) {
        Page<UserEntity> users = userService.getAllUsersByRole(search, pageable);
        Page<?> mappedPage = userRoleMapperFactory.getMapper(Role.valueOf(search.toUpperCase()), users);
        return ResponseEntity.ok(mappedPage);
    }

    @GetMapping("/all_doctors")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<Page<DoctorDto>> doctors(Pageable pageable) {
        Page<UserEntity> users = userService.getAllUsersByRole("DOCTOR", pageable);
        return new ResponseEntity<>(DoctorMapper.INSTANCE.toDtoPage(users), HttpStatus.OK);
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

        return new ResponseEntity<>(DoctorMapper.INSTANCE.toDtoPage(usersPage), HttpStatus.OK);
    }


    @GetMapping("/doctor/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<DoctorDto> doctor(@PathVariable String id) {
        UserEntity user = userService.getDoctor(id);
        DoctorDto dto = DoctorMapper.INSTANCE.toDto(user);
        Map<String, List<String>> availableSlotsByDate = new HashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 0; i < 15; i++) {
            LocalDate date = today.plusDays(i);
            List<String> slots = userService.getAvailableSlots(id, date.toString());
            // Filter out past slots for today
            if (i == 0) {
                java.time.LocalTime now = java.time.LocalTime.now().plusMinutes(30);
                slots = slots.stream()
                        .filter(slot -> {
                            String[] parts = slot.split(":");
                            int hour = Integer.parseInt(parts[0]);
                            int minute = Integer.parseInt(parts[1]);
                            java.time.LocalTime slotTime = java.time.LocalTime.of(hour, minute);
                            return slotTime.isAfter(now);
                        })
                        .toList();
            }
            availableSlotsByDate.put(date.toString(), slots);
        }
        dto.setAvailableSlotsByDate(availableSlotsByDate);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @GetMapping("/doctor/{id}/available-slots")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<List<String>> getAvailableSlots(@PathVariable String id, @RequestParam String date) {
        List<String> availableSlots = userService.getAvailableSlots(id, date);
        return ResponseEntity.ok(availableSlots);
    }

    @PutMapping("/user/update_profile")
    public ResponseEntity<?> updateUser(@RequestBody UserCommand userCommand) {
        UserEntity currentUser = userService.getCurrentUser();

        UserEntity updatedUser = userService.updateProfile(userCommand);

        Object dto = userRoleMapperFactory.getMapper(currentUser.getRole(), updatedUser);

        return new ResponseEntity<>(dto, HttpStatus.OK);
    }


    @PutMapping("/user/update_doctor_profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDto> updateUser(@RequestBody DoctorProfileCommand doctorProfileCommand) {
        return new ResponseEntity<>(DoctorMapper.INSTANCE.toDto(userService.updateProfile(doctorProfileCommand)),HttpStatus.OK);
    }

    @PutMapping("/user/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordCommand command) {
        userService.changePassword(command);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @DeleteMapping("/user")
    public ResponseEntity<?> deleteAccount(@RequestBody DeleteAccountCommand command) {
        userService.deleteAccount(command);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

}
