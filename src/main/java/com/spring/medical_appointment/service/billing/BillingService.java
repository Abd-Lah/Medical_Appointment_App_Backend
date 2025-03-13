package com.spring.medical_appointment.service.billing;

import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.UserEntity;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

@Service
public interface BillingService {
    void appointmentBill(AppointmentEntity appointment, UserEntity user) ;
    Resource GetMyAppointmentBill(String filename);
}
