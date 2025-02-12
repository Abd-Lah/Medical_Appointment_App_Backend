package repository;

import model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepoPatient extends JpaRepository<Patient, Integer> {

}
