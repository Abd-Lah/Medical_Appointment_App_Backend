package com.spring.medical_appointment.repository;

import com.spring.medical_appointment.models.AppointmentEntity;
import com.spring.medical_appointment.models.AppointmentStatus;
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
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, String>, JpaSpecificationExecutor<AppointmentEntity> {

    @Query("SELECT a FROM AppointmentEntity a WHERE a.id = :appointmentId AND (a.doctor = :userEntity OR a.patient = :userEntity) AND a.deleted = false")
    AppointmentEntity findByAppointmentIdAndByUserId(String appointmentId, UserEntity userEntity);

    default Page<AppointmentEntity> getAppointments(UserEntity logged, String orderBy, Pageable pageable) {
        return findAll((root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<AppointmentEntity, UserEntity> patientJoin = root.join(logged.getRole().toString().toLowerCase(), JoinType.INNER);

            predicates.add(builder.equal(patientJoin.get("id"), logged.getId()));
            predicates.add(builder.equal(root.get("deleted"), false));

            if ("asc".equalsIgnoreCase(orderBy)) {
                query.orderBy(builder.asc(root.get("appointmentDate")));
            } else if ("desc".equalsIgnoreCase(orderBy)) {
                query.orderBy(builder.desc(root.get("appointmentDate")));
            }

            return builder.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Query("SELECT COUNT(a) > 0 FROM AppointmentEntity a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :appointmentDate AND a.status = :status AND a.deleted = false")
    Boolean alreadyTaken(@Param("doctorId") String doctorId, @Param("appointmentDate") LocalDateTime appointmentDate,@Param("status") AppointmentStatus status);

    @Query("SELECT COUNT(a) > 0 FROM AppointmentEntity a WHERE a.patient.id = :id AND a.status = :status AND a.deleted = false")
    Boolean pending(String id, AppointmentStatus status);

    @Query("SELECT COUNT(a) > 4 FROM AppointmentEntity a " +
            "WHERE a.patient = :patient " +
            "AND a.status = :status " +
            "AND a.appointmentDate >= :startDate " +
            "AND a.appointmentDate <= :endDate " +
            "AND a.deleted = false")
    Boolean canceled(UserEntity patient, AppointmentStatus status, LocalDateTime startDate, LocalDateTime endDate);

    // Find all appointments for a doctor on a given date and with given statuses
    @Query("SELECT a FROM AppointmentEntity a WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :start AND :end AND a.status IN :statuses AND a.deleted = false")
    List<AppointmentEntity> findAllByDoctorIdAndAppointmentDateBetweenAndStatusIn(
        @Param("doctorId") String doctorId, 
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end, 
        @Param("statuses") List<AppointmentStatus> statuses
    );

    // Find all appointments for a patient (non-deleted only)
    @Query("SELECT a FROM AppointmentEntity a WHERE a.patient = :patient AND a.deleted = false")
    List<AppointmentEntity> findByPatient(@Param("patient") UserEntity patient);

    // Find all appointments for a doctor (non-deleted only)
    @Query("SELECT a FROM AppointmentEntity a WHERE a.doctor = :doctor AND a.deleted = false")
    List<AppointmentEntity> findByDoctor(@Param("doctor") UserEntity doctor);

}
