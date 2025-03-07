package com.spring.medical_appointment.controller.user;

import com.spring.medical_appointment.commands.ReportCommand;
import com.spring.medical_appointment.dto.AppointmentDoctorDto;
import com.spring.medical_appointment.dto.AppointmentDto;
import com.spring.medical_appointment.dto.ReportDto;
import com.spring.medical_appointment.mapper.AppointmentMapper;
import com.spring.medical_appointment.mapper.ReportMapper;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.AppointmentStatus;
import com.spring.medical_appointment.models.ReportEntity;
import com.spring.medical_appointment.service.doctor.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {
    private final DoctorService doctorService;

    @GetMapping("/appointment")
    public ResponseEntity<Page<AppointmentDoctorDto>> getMyAppointment(Pageable pageable, @RequestParam(name="order", defaultValue = "desc") String orderBy) {
        Page<AppointmentEntity> myAppointment = doctorService.getMyAppointment(pageable ,orderBy);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDocotorDtoPage(myAppointment), HttpStatus.OK);
    }

    @PatchMapping(path = "/appointment/{appointmentId}")
    public ResponseEntity<AppointmentDoctorDto> updateAppointmentStatus(@RequestBody String status, @PathVariable String appointmentId) {
        AppointmentStatus appointmentStatus = AppointmentStatus.APPROVED;
        AppointmentEntity appointment = doctorService.changeStatus(appointmentStatus, appointmentId);
        return new ResponseEntity<>(AppointmentMapper.INSTANCE.ToAppointmentDoctorDto(appointment), HttpStatus.OK);
    }

    @PostMapping(path = "/report/{appointmentId}")
    public ResponseEntity<ReportDto> createReport(@Valid @RequestBody ReportCommand reportCommand, @PathVariable String appointmentId) {
        ReportEntity reportEntity = doctorService.addReport(reportCommand, appointmentId);
        return new ResponseEntity<>(ReportMapper.INSTANCE.ToReportDto(reportEntity), HttpStatus.CREATED);
    }

    @PutMapping(path = "/report/{reportId}")
    public ResponseEntity<ReportDto> editReport(@Valid @RequestBody ReportCommand reportCommand, @PathVariable String reportId) {
        ReportEntity reportEntity = doctorService.editReport(reportCommand, reportId);
        return new ResponseEntity<>(ReportMapper.INSTANCE.ToReportDto(reportEntity), HttpStatus.CREATED);
    }

}
