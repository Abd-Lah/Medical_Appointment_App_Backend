package com.spring.medical_appointment.service.patient;

import com.spring.medical_appointment.commands.AppointmentCommand;
import com.spring.medical_appointment.exceptions.InvalidRequestException;
import com.spring.medical_appointment.mapper.DoctorProfileMapper;
import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.AppointmentStatus;
import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.repository.AppointmentRepository;
import com.spring.medical_appointment.service.billing.BillingService;
import com.spring.medical_appointment.service.user.UserService;
import com.spring.medical_appointment.util.Helper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final UserService userService;
    private final AppointmentRepository appointmentRepository;
    private final BillingService billingService;
    private final Helper<AppointmentEntity> helpers;

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
        Boolean alreadyTaken = appointmentRepository.alreadyTaken(doctor.getId(),newAppointment.getAppointmentDate(), AppointmentStatus.PENDING);
        Boolean canceled = appointmentRepository.canceled(loggedPatient, AppointmentStatus.CANCELLED, AppointmentCommand.APPOINTMENT_BEFORE_DAYS, AppointmentCommand.APPOINTMENT_AFTER_DAYS);
        Boolean hasPendingAppointment = appointmentRepository.pending(loggedPatient.getId(), AppointmentStatus.PENDING);
        newAppointment.validate(DoctorProfileMapper.INSTANCE.toDoctorProfileDto(doctor.getDoctorProfile()),alreadyTaken, hasPendingAppointment, canceled);
        AppointmentEntity appointment = new AppointmentEntity(loggedPatient, doctor, newAppointment.getAppointmentDate(), AppointmentStatus.PENDING, null);
        billingService.appointmentBill(appointment, loggedPatient);
        return appointmentRepository.save(appointment);
    }

    @Override
    public AppointmentEntity updateAppointment(AppointmentCommand appointment, String appointmentId) {
        UserEntity loggedPatient = userService.getCurrentUser();
        AppointmentEntity existingAppointment = appointmentRepository.findByAppointmentIdAndByUserId(appointmentId,loggedPatient);
        helpers.isObjectNull(existingAppointment, "No appointment found");
        UserEntity doctor = existingAppointment.getDoctor();
        Boolean alreadyTaken = appointmentRepository.alreadyTaken(doctor.getId(),appointment.getAppointmentDate(), AppointmentStatus.PENDING);
        appointment.validateInUpdate(existingAppointment,DoctorProfileMapper.INSTANCE.toDoctorProfileDto(doctor.getDoctorProfile()),alreadyTaken, false);
        existingAppointment.setAppointmentDate(appointment.getAppointmentDate());
        billingService.appointmentBill(existingAppointment, loggedPatient);
        return appointmentRepository.save(existingAppointment);
    }

    @Override
    public void cancelAppointment(String appointmentId) {
        UserEntity loggedPatient = userService.getCurrentUser();
        AppointmentEntity existingAppointment = appointmentRepository.findByAppointmentIdAndByUserId(appointmentId,loggedPatient);
        helpers.isObjectNull(existingAppointment, "No appointment found");
        if(!existingAppointment.getAppointmentDate().isAfter(LocalDateTime.now().plusHours(AppointmentCommand.APPOINTMENT_BEFORE_HOURS))) {
            throw new InvalidRequestException("You cant canceler this appointment, because it still less than 8 hours");
        }
        existingAppointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(existingAppointment);
        billingService.appointmentBill(existingAppointment, loggedPatient);
    }

}
