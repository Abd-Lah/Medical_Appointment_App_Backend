package service;

import model.Appointment;
import model.Medcin;

import java.util.Collection;
import java.util.List;

public interface MedecinService {
    List<Medcin> getAllMedecin();
    Medcin getMedecinById(int id);
    Medcin addMedecin(Medcin medecin);
    Medcin updateMedecin(int id,Medcin medecin);
    Collection<Appointment> getAllAppointmentByMedecinId(int id);
    void deleteMedecin(int id);
}
