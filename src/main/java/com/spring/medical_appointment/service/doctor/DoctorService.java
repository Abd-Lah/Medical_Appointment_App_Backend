package com.spring.medical_appointment.service.doctor;

import com.spring.medical_appointment.commands.ReportCommand;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.AppointmentStatus;
import com.spring.medical_appointment.models.ReportEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DoctorService {
    Page<AppointmentEntity> getMyAppointment(Pageable pageable ,String orderBy);
    AppointmentEntity changeStatus(AppointmentStatus status, String appointmentId);
    ReportEntity addReport(ReportCommand reportCommand, String appointmentId);
    ReportEntity editReport(ReportCommand reportCommand, String reportId);
}
