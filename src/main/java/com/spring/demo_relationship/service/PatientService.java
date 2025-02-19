package com.spring.demo_relationship.service;


import com.spring.demo_relationship.commands.PatientCommand;
import com.spring.demo_relationship.dto.AppointmentDto;
import com.spring.demo_relationship.dto.PatientDto;
import com.spring.demo_relationship.model.Medcin;
import com.spring.demo_relationship.model.Patient;

import java.time.LocalDateTime;
import java.util.List;

public interface PatientService {

    List<PatientDto> getAllPatients();

    PatientDto getPatientById(int id);

    PatientDto createPatient(Patient patient);

    PatientDto updatePatient(int id, PatientCommand patient);

    List<AppointmentDto> getAppointmentsByPatientId(int id);

    AppointmentDto makeAppointment(Patient patient, Medcin doctor, LocalDateTime dateApp);

    void deletePatient(int id);
}
