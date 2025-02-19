package com.spring.demo_relationship.service;

import com.spring.demo_relationship.model.Appointment;
import com.spring.demo_relationship.model.Medcin;

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
