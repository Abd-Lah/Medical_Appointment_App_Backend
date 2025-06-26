package com.spring.medical_appointment.service.patient;

import com.spring.medical_appointment.commands.AppointmentCommand;
import com.spring.medical_appointment.models.AppointmentEntity;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {
    
    Page<AppointmentEntity> getMyAppointment(Pageable pageable, String orderBy);

    AppointmentEntity makeAppointment(AppointmentCommand appointment);

    AppointmentEntity updateAppointment(AppointmentCommand appointment, String appointmentId);

    void cancelAppointment(String appointmentId);

    Resource getMyAppointmentBill(String appointmentId);
    
    void regenerateBill(String appointmentId);
}
