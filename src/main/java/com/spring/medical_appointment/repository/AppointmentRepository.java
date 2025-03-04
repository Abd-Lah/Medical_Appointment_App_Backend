package com.spring.medical_appointment.repository;

import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.UserEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Long>, JpaSpecificationExecutor<AppointmentEntity> {

    // Custom method using Specification to handle dynamic ordering by appointmentDate
    default Page<AppointmentEntity> getAppointments(UserEntity loggedPatient, String orderBy, Pageable pageable) {
        return findAll((root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<AppointmentEntity, UserEntity> patientJoin = root.join("patient", JoinType.INNER);

            predicates.add(builder.equal(patientJoin.get("id"), loggedPatient.getId()));

            if ("asc".equalsIgnoreCase(orderBy)) {
                query.orderBy(builder.asc(root.get("appointmentDate")));
            } else if ("desc".equalsIgnoreCase(orderBy)) {
                query.orderBy(builder.desc(root.get("appointmentDate")));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Query("SELECT COUNT(a) > 0 FROM AppointmentEntity a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :appointmentDate")
    Boolean alreadyTaken(@Param("doctorId") String doctorId, @Param("appointmentDate") LocalDateTime appointmentDate);

}
