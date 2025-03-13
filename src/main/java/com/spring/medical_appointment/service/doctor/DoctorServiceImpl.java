package com.spring.medical_appointment.service.doctor;

import com.spring.medical_appointment.commands.ReportCommand;
import com.spring.medical_appointment.dto.ReportDto;
import com.spring.medical_appointment.mapper.ReportMapper;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.AppointmentStatus;
import com.spring.medical_appointment.models.ReportEntity;
import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.repository.AppointmentRepository;
import com.spring.medical_appointment.repository.ReportRepository;
import com.spring.medical_appointment.service.billing.BillingService;
import com.spring.medical_appointment.service.user.UserService;
import com.spring.medical_appointment.util.Helper;
import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {
    private final UserService userService;
    private final AppointmentRepository appointmentRepository;
    private final BillingService billingService;
    private final ReportRepository reportRepository;
    private final Helper<ReportEntity> helpersReport;
    private final Helper<AppointmentEntity> helpersAppointment;

    @Override
    public Page<AppointmentEntity> getMyAppointment(Pageable pageable, String orderBy) {
        UserEntity loggedDoctor = userService.getCurrentUser();
        return appointmentRepository.getAppointments(loggedDoctor ,orderBy ,pageable);
    }

    @Override
    @Transactional
    public AppointmentEntity changeStatus(AppointmentStatus status, String appointmentId) {
        UserEntity loggedDoctor = userService.getCurrentUser();
        AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndByUserId(appointmentId, loggedDoctor);
        helpersAppointment.isObjectNull(appointment,"No appointment found");
        if(appointment.getAppointmentDate().isAfter(LocalDateTime.now())) {
            if(status == AppointmentStatus.APPROVED) {
                throw new ValidationException("Cannot change status of appointment");
            }
        }
        appointment.setStatus(status);
        billingService.appointmentBill(appointment, appointment.getPatient());
        return appointmentRepository.save(appointment);
    }

    @Override
    @Transactional
    public ReportEntity addReport(ReportCommand reportCommand, String appointmentId) {
        UserEntity loggedDoctor = userService.getCurrentUser();
        AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndByUserId(appointmentId, loggedDoctor);
        helpersAppointment.isObjectNull(appointment,"No appointment found");
        if(appointment.getStatus() == AppointmentStatus.APPROVED) {
            return reportRepository.save(new ReportEntity(reportCommand, appointment));
        }
        throw new ValidationException("The appointment is "+appointment.getStatus().toString().toLowerCase()+". To add report should be approved !");
    }

    @Override
    public ReportEntity editReport(ReportCommand reportCommand, String reportId) {
        UserEntity loggedDoctor = userService.getCurrentUser();
        ReportEntity reportEntity = reportRepository.findById(reportId).orElse(null);
        helpersReport.isObjectNull(reportEntity,"No report found");
        AppointmentEntity appointment = appointmentRepository.findByAppointmentIdAndByUserId(reportEntity.getAppointment().getId(), loggedDoctor);
        helpersAppointment.isObjectNull(appointment,"No appointment found");
        reportEntity.update(reportCommand);
        reportRepository.save(reportEntity);
        return reportEntity;
    }

}
