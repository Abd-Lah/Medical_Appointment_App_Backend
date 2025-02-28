package com.spring.demo_relationship.service.patient;

import com.spring.demo_relationship.commands.AppointmentCommand;
import com.spring.demo_relationship.models.AppointmentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {
    Page<AppointmentEntity> getMyAppointment(Pageable pageable, String orderBy);

    AppointmentEntity makeAppointment(AppointmentCommand appointment);
}
