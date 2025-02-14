package controllers;

import model.Medcin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import service.MedecinServiceImp;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {
    @Autowired
    MedecinServiceImp medecinServiceImp;

    @GetMapping
    public List<Medcin> getAllDoctors() {
        return medecinServiceImp.getAllMedecin();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medcin> getDoctorById(@PathVariable int id) {
        return new ResponseEntity<>(medecinServiceImp.getMedecinById(id), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Medcin> createDoctor(@RequestBody Medcin medecin) {
        Medcin medcin = medecinServiceImp.addMedecin(medecin);
        return new ResponseEntity<>(medcin, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medcin> updateDoctor(@PathVariable int id, @RequestBody Medcin medecin) {
        Medcin medcin = medecinServiceImp.updateMedecin(id, medecin);
        return new ResponseEntity<>(medcin, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Medcin> deleteDoctor(@PathVariable int id) {
        medecinServiceImp.deleteMedecin(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
