package com.spring.demo_relationship.service.imp;

import com.spring.demo_relationship.commands.PatientCommand;
import com.spring.demo_relationship.dto.AppointmentDto;
import com.spring.demo_relationship.dto.PatientDto;
import com.spring.demo_relationship.exceptions.ResourceNotFoundException;
import com.spring.demo_relationship.mappers.PatientMapper;
import com.spring.demo_relationship.service.PatientService;
import jakarta.transaction.Transactional;
import com.spring.demo_relationship.model.Appointment;
import com.spring.demo_relationship.model.Medcin;
import com.spring.demo_relationship.model.Patient;
import org.springframework.stereotype.Service;
import com.spring.demo_relationship.repository.RepoAppointment;
import com.spring.demo_relationship.repository.RepoConsultation;
import com.spring.demo_relationship.repository.RepoPatient;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientServiceImp implements PatientService {

    private final RepoPatient repoPatient;
    private final RepoAppointment repoAppointment;
    private final RepoConsultation repoConsultation;

    public PatientServiceImp(RepoPatient repoPatient, RepoAppointment repoAppointment, RepoConsultation repoConsultation) {
        this.repoPatient = repoPatient;
        this.repoAppointment = repoAppointment;
        this.repoConsultation = repoConsultation;
    }

    @Override
    public List<PatientDto> getAllPatients() {
        List<Patient> patients = repoPatient.findAll();
        return patients
                .stream()
                .map(PatientMapper.INSTANCE::patientToPatientDtoWithoutAppointments)
                .collect(Collectors.toList());
    }

    public Patient getById(Integer id) {
        return repoPatient.findById(id).orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + id + " not found"));
    }
    @Override
    public PatientDto getPatientById(int id) {
        Patient patient = getById(id);
        return PatientMapper.INSTANCE.patientToPatientDtoWithAppointments(patient);
    }

    @Transactional
    @Override
    public PatientDto createPatient(Patient patient) {
        Patient savedPatient = repoPatient.save(patient);
        return PatientMapper.INSTANCE.patientToPatientDtoWithoutAppointments(savedPatient);
    }

    @Transactional
    @Override
    public PatientDto updatePatient(int id, PatientCommand patient) {
        Patient existingPatient = getById(id);
        existingPatient.setName(patient.getName());
        existingPatient.setEmail(patient.getEmail());
        existingPatient.setPhone(patient.getPhone());
        Patient updatedPatient = repoPatient.save(existingPatient);
        return PatientMapper.INSTANCE.patientToPatientDtoWithoutAppointments(updatedPatient);
    }

    @Override
    public List<AppointmentDto> getAppointmentsByPatientId(int id) {
        Patient patient = getById(id);

        // Null check or handle it using Optional
        if (patient != null && patient.getAppointments() != null) {
            return PatientMapper.INSTANCE.appointmentsToAppointmentDtos(patient.getAppointments());
        }

        return Collections.emptyList();
    }

    @Transactional
    @Override
    public AppointmentDto makeAppointment(Patient patient, Medcin doctor, LocalDateTime date_app) {
        Appointment appointment = new Appointment(null,date_app,patient,doctor,null);
        return PatientMapper.INSTANCE.appointmentToAppointmentDto(repoAppointment.save(appointment));
    }

    @Transactional
    @Override
    public void deletePatient(int id) {
        Patient patient = getById(id);
        Collection<Appointment> patientAppointment = patient.getAppointments();
        patientAppointment.forEach(appointment -> {
            if (appointment.getConsultation() != null) {
                repoConsultation.delete(appointment.getConsultation());
            }
        });

        repoAppointment.deleteAll(patientAppointment);

        repoPatient.delete(patient);
    }
}
