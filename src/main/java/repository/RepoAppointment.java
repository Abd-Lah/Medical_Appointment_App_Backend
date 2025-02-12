package repository;

import model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepoAppointment extends JpaRepository<Appointment, Integer> {
}
