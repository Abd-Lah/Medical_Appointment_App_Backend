package repository;

import model.Medcin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepoMedcin extends JpaRepository<Medcin, Integer> {
}
