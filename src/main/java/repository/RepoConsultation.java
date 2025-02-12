package repository;

import model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepoConsultation extends JpaRepository<Consultation, Integer> {
}
