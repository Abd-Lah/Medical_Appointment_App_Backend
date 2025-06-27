package com.spring.medical_appointment.repository;

import com.spring.medical_appointment.models.DoctorProfile;
import com.spring.medical_appointment.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, String> {
    
    @Query("SELECT dp FROM DoctorProfile dp WHERE dp.doctor = :user AND dp.deleted = false")
    DoctorProfile getDoctorProfileByDoctor(@Param("user") UserEntity user);
    
    @Query("SELECT dp FROM DoctorProfile dp WHERE dp.doctor.id = :doctorId AND dp.deleted = false")
    DoctorProfile findByDoctorId(@Param("doctorId") String doctorId);
    
    // Override default findById to exclude deleted records
    @Override
    @Query("SELECT dp FROM DoctorProfile dp WHERE dp.id = :id AND dp.deleted = false")
    java.util.Optional<DoctorProfile> findById(@Param("id") String id);
}
