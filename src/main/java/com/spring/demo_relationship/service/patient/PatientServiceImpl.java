package com.spring.demo_relationship.service.patient;

import com.spring.demo_relationship.commands.AppointmentCommand;
import com.spring.demo_relationship.models.AppointmentEntity;
import com.spring.demo_relationship.models.UserEntity;
import com.spring.demo_relationship.repository.AppointmentRepository;
import com.spring.demo_relationship.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final UserService userService;
    private final AppointmentRepository appointmentRepository;

    @Override
    public Page<AppointmentEntity> getMyAppointment(Pageable pageable ,String orderBy) {
        UserEntity loggedPatient = userService.getCurrentUser();
        return appointmentRepository.getAppointments(loggedPatient ,orderBy ,pageable);
    }


    @Override
    @Transactional
    public AppointmentEntity makeAppointment(AppointmentCommand newAppointment) {
        UserEntity loggedPatient = userService.getCurrentUser();
        UserEntity doctor = userService.getDoctor(newAppointment.getDoctorId());
        AppointmentEntity appointment = new AppointmentEntity(loggedPatient, doctor, newAppointment.getAppointmentDate(), null);
        return appointmentRepository.save(appointment);
    }
}
