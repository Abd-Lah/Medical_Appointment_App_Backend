package com.spring.medical_appointment.repository;

import com.spring.medical_appointment.models.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<ReportEntity,String> {
    Optional<ReportEntity> findById(String id);
}
