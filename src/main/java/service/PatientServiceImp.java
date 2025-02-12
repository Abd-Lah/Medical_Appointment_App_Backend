package service;

import exceptions.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import model.Appointment;
import model.Patient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repository.RepoAppointment;
import repository.RepoConsultation;
import repository.RepoPatient;

import java.util.Collection;
import java.util.List;

@Service
public class PatientServiceImp implements PatientService {

    private final RepoPatient repoPatient;
    private final RepoAppointment repoAppointment;
    private final RepoConsultation repoConsultation;

    @Autowired
    public PatientServiceImp(RepoPatient repoPatient, RepoAppointment repoAppointment, RepoConsultation repoConsultation) {
        this.repoPatient = repoPatient;
        this.repoAppointment = repoAppointment;
        this.repoConsultation = repoConsultation;
    }

    @Override
    public List<Patient> getAllPatients() {
        return repoPatient.findAll();
    }

    @Override
    public Patient getPatientById(int id) {
        return repoPatient.findById(id).orElseThrow(() -> new ResourceNotFoundException("Patient with ID " + id + " not found"));
    }

    @Transactional
    @Override
    public Patient createPatient(Patient patient) {
        return repoPatient.save(patient);
    }

    @Transactional
    @Override
    public Patient updatePatient(int id, Patient patient) {
        Patient existingPatient = getPatientById(id);
        existingPatient.setName(patient.getName());
        existingPatient.setEmail(patient.getEmail());
        existingPatient.setPhone(patient.getPhone());
        return repoPatient.save(existingPatient);
    }

    @Override
    public Collection<Appointment> getAppointmentsByPatientId(int id) {
        Patient patient = getPatientById(id);
        return patient.getAppointments();
    }

    @Transactional
    @Override
    public void deletePatient(int id) {
        Patient patient = getPatientById(id);
        getAppointmentsByPatientId(id).forEach(appointment -> {
            if (appointment.getConsultation() != null) {
                repoConsultation.delete(appointment.getConsultation());
            }
        });

        repoAppointment.deleteAll(getAppointmentsByPatientId(id));

        repoPatient.delete(patient);
    }
}
