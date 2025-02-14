package service;


import model.Appointment;
import model.Medcin;
import model.Patient;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Date;
import java.util.List;

public interface PatientService {
    List<Patient> getAllPatients();
    Patient getPatientById(int id);
    Patient createPatient(Patient patient);
    Patient updatePatient(int id, Patient patient);
    Collection<Appointment> getAppointmentsByPatientId(int id);
    Appointment makeAppointment(Patient patient, Medcin doctor, LocalDateTime date_app);
    void deletePatient(int id);
}
