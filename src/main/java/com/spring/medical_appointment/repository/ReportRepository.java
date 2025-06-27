package com.spring.medical_appointment.repository;

import com.spring.medical_appointment.models.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<ReportEntity,String> {
    
    @Override
    @Query("SELECT r FROM ReportEntity r WHERE r.id = :id AND r.deleted = false")
    Optional<ReportEntity> findById(@Param("id") String id);
}
