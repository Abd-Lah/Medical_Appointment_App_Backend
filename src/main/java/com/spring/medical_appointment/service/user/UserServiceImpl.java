package com.spring.medical_appointment.service.user;

import com.spring.medical_appointment.commands.ChangePasswordCommand;
import com.spring.medical_appointment.commands.DeleteAccountCommand;
import com.spring.medical_appointment.commands.DoctorProfileCommand;
import com.spring.medical_appointment.commands.UserCommand;
import com.spring.medical_appointment.exceptions.ForbiddenException;
import com.spring.medical_appointment.exceptions.ResourceNotFoundException;
import com.spring.medical_appointment.models.*;
import com.spring.medical_appointment.repository.AppointmentRepository;
import com.spring.medical_appointment.repository.DoctorProfileRepository;
import com.spring.medical_appointment.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    private UserEntity getProfile(String email) {
        UserEntity user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ResourceNotFoundException("User with email : " + email + " not found");
        }
        return user;

    }

    @Override
    @Transactional
    public UserEntity updateProfile(UserCommand userCommand) {
        UserEntity existingUser = getCurrentUser();
        existingUser.updateUserProfile(userCommand);
        userRepository.save(existingUser);
        return existingUser;
    }

    @Override
    @Transactional
    public UserEntity updateProfile(DoctorProfileCommand profile) {
        UserEntity existingUser = getCurrentUser();
        DoctorProfile existingDoctorProfile = existingUser.getDoctorProfile();
        existingDoctorProfile.updateDoctorProfile(profile);
        doctorProfileRepository.save(existingDoctorProfile);
        return existingUser;
    }

    @Override
    @Transactional
    public UserEntity updateProfilePicture(String profilePictureUrl) {
        UserEntity existingUser = getCurrentUser();
        existingUser.setProfilePictureUrl(profilePictureUrl);
        userRepository.save(existingUser);
        return existingUser;
    }

    @Override
    public Page<UserEntity> getAllUsersByRole(String role, Pageable pageable) {
        Role roleEnum = Role.valueOf(role.toUpperCase());
        return userRepository.findUsersByRole(roleEnum, pageable);
    }

    @Override
    public Page<UserEntity> getAllDoctors(String firstName, String lastName, String city, String specialization, Pageable pageable) {
        return userRepository.getDoctors(firstName, lastName, city, specialization, pageable);
    }


    @Override
    public UserEntity getDoctor(String id) {
        UserEntity doctor = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User with id : " + id + " not found"));
        if (doctor.getRole() == Role.DOCTOR) {
            return doctor;
        }else{
            throw new ResourceNotFoundException("Doctor with id : " + id + " not found");
        }
    }

    @Override
    public UserEntity getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String email = userDetails.getUsername();
        return getProfile(email);
    }

    @Override
    public List<String> getAvailableSlots(String doctorId, String date) {
        UserEntity doctor = getDoctor(doctorId);
        DoctorProfile doctorProfile = doctor.getDoctorProfile();
        if (doctorProfile == null) {
            return new ArrayList<>();
        }
        LocalDate appointmentDate = LocalDate.parse(date);
        // Check if it's a working day
        if (!isWorkingDay(appointmentDate, doctorProfile.getWorkingDays())) {
            return new ArrayList<>();
        }
        // Generate available times
        LocalTime startTime = LocalTime.parse(doctorProfile.getStartTime());
        LocalTime endTime = LocalTime.parse(doctorProfile.getEndTime());
        LocalTime breakStartTime = LocalTime.parse(doctorProfile.getBreakTimeStart());
        LocalTime breakEndTime = LocalTime.parse(doctorProfile.getBreakTimeEnd());
        int appointmentDuration = doctorProfile.getAppointmentDuration();
        List<String> allSlots = generateAvailableTimes(startTime, endTime, breakStartTime, breakEndTime, appointmentDuration);
        // Query booked slots for this doctor and date (PENDING or APPROVED)
        LocalDateTime dayStart = appointmentDate.atStartOfDay();
        LocalDateTime dayEnd = appointmentDate.plusDays(1).atStartOfDay();
        List<AppointmentEntity> bookedAppointments = appointmentRepository.findAllByDoctorIdAndAppointmentDateBetweenAndStatusIn(
            doctorId, dayStart, dayEnd, List.of(AppointmentStatus.PENDING, AppointmentStatus.APPROVED)
        );
        List<String> bookedTimes = bookedAppointments.stream()
            .map(a -> String.format("%02d:%02d", a.getAppointmentDate().getHour(), a.getAppointmentDate().getMinute()))
            .toList();
        // Exclude booked times
        List<String> availableSlots = allSlots.stream()
            .filter(slot -> !bookedTimes.contains(slot))
            .toList();
        return availableSlots;
    }
    
    private boolean isWorkingDay(LocalDate appointmentDate, String workingDays) {
        DayOfWeek dayOfWeek = appointmentDate.getDayOfWeek();
        String dayName = dayOfWeek.toString().toLowerCase();
        
        // Handle different possible formats of working days
        String[] workingDayArray = workingDays.toLowerCase().split(",");
        List<String> workingDayList = Arrays.asList(workingDayArray);

        // Trim whitespace from each day name
        workingDayList = workingDayList.stream()
                .map(String::trim)
                .toList();

        return workingDayList.contains(dayName);
    }

    private List<String> generateAvailableTimes(LocalTime startTime,
                                                LocalTime endTime,
                                                LocalTime breakStartTime,
                                                LocalTime breakEndTime,
                                                int appointmentDuration) {
        List<String> availableTimes = new ArrayList<>();
        LocalTime currentTime = startTime;

        // Generate slots before break
        while (!currentTime.isAfter(breakStartTime.minusMinutes(appointmentDuration))) {
            String timeString = String.format("%02d:%02d", currentTime.getHour(), currentTime.getMinute());
            availableTimes.add(timeString);
            currentTime = currentTime.plusMinutes(appointmentDuration);
        }

        // Generate slots after break
        currentTime = breakEndTime;
        while (!currentTime.isAfter(endTime.minusMinutes(appointmentDuration))) {
            String timeString = String.format("%02d:%02d", currentTime.getHour(), currentTime.getMinute());
            availableTimes.add(timeString);
            currentTime = currentTime.plusMinutes(appointmentDuration);
        }
        
        return availableTimes;
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordCommand command) {
        UserEntity currentUser = getCurrentUser();
        
        // Verify current password
        if (!passwordEncoder.matches(command.getCurrentPassword(), currentUser.getPassword())) {
            throw new ForbiddenException("Current password is incorrect");
        }
        
        // Validate new password
        if (command.getNewPassword() == null || command.getNewPassword().length() < 6) {
            throw new ForbiddenException("New password must be at least 6 characters long");
        }
        
        // Hash and update new password
        String hashedNewPassword = passwordEncoder.encode(command.getNewPassword());
        currentUser.setPassword(hashedNewPassword);
        
        userRepository.save(currentUser);
    }

    @Override
    @Transactional
    public void deleteAccount(DeleteAccountCommand command) {
        UserEntity currentUser = getCurrentUser();
        
        // Verify password
        if (!passwordEncoder.matches(command.getPassword(), currentUser.getPassword())) {
            throw new ForbiddenException("Password is incorrect");
        }
        
        // Soft delete associated appointments
        List<AppointmentEntity> appointments;
        if (currentUser.getRole() == Role.PATIENT) {
            appointments = appointmentRepository.findByPatient(currentUser);
        } else if (currentUser.getRole() == Role.DOCTOR) {
            appointments = appointmentRepository.findByDoctor(currentUser);
        } else {
            appointments = List.of(); // Admin doesn't have appointments
        }
        
        // Soft delete appointments by setting deleted flag
        for (AppointmentEntity appointment : appointments) {
            appointment.setDeleted(true);
            appointmentRepository.save(appointment);
        }
        
        // Soft delete doctor profile if exists
        if (currentUser.getDoctorProfile() != null) {
            currentUser.getDoctorProfile().setDeleted(true);
            doctorProfileRepository.save(currentUser.getDoctorProfile());
        }
        
        // Soft delete user by setting deleted flag to true
        currentUser.setDeleted(true);
        currentUser.setActive(false);
        userRepository.save(currentUser);
    }
}
