package service;


import model.Appointment;
import model.Patient;

import java.util.Collection;
import java.util.List;

public interface PatientService {
    List<Patient> getAllPatients();
    Patient getPatientById(int id);
    Patient createPatient(Patient patient);
    Patient updatePatient(int id, Patient patient);
    Collection<Appointment> getAppointmentsByPatientId(int id);
    void deletePatient(int id);
}
