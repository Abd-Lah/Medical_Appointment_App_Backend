package service;

import exceptions.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import model.Appointment;
import model.Medcin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import repository.RepoAppointment;
import repository.RepoConsultation;
import repository.RepoMedcin;

import java.util.Collection;
import java.util.List;

@Service
public class MedecinServiceImp implements MedecinService {
    private final RepoMedcin repoMedcin;
    private final RepoAppointment repoAppointment;
    private final RepoConsultation repoConsultation;

    @Autowired
    public MedecinServiceImp(RepoMedcin repoMedcin, RepoAppointment repoAppointment, RepoConsultation repoConsultation) {
        this.repoMedcin = repoMedcin;
        this.repoAppointment = repoAppointment;
        this.repoConsultation = repoConsultation;
    }

    @Override
    public List<Medcin> getAllMedecin() {
        return repoMedcin.findAll();
    }

    @Override
    public Medcin getMedecinById(int id) {
        return repoMedcin.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor with ID : " + id + " not found"));
    }

    @Transactional
    @Override
    public Medcin addMedecin(Medcin medecin) {
        return repoMedcin.save(medecin);
    }

    @Transactional
    @Override
    public Medcin updateMedecin(int id, Medcin medecin) {
        Medcin existingMedecin = getMedecinById(id);
        existingMedecin.setName(medecin.getName());
        existingMedecin.setPhone(medecin.getPhone());
        existingMedecin.setEmail(medecin.getEmail());
        existingMedecin.setSpecialize(medecin.getSpecialize());
        return repoMedcin.save(existingMedecin);
    }

    @Override
    public Collection<Appointment> getAllAppointmentByMedecinId(int id) {
        Medcin medecin = getMedecinById(id);
        return medecin.getAppointments();
    }

    @Transactional
    @Override
    public void deleteMedecin(int id) {
        Medcin existingMedecin = getMedecinById(id);
        Collection<Appointment> docAppointments = existingMedecin.getAppointments();
        docAppointments.forEach(appointment -> {
            if(appointment.getConsultation() != null) {
                repoConsultation.delete(appointment.getConsultation());
            }
        });
        repoAppointment.deleteAll(docAppointments);
        repoMedcin.delete(existingMedecin);
    }
}
