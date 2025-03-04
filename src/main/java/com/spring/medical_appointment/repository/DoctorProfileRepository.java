package com.spring.medical_appointment.repository;

import com.spring.medical_appointment.models.DoctorProfile;
import com.spring.medical_appointment.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, String> {
    DoctorProfile getDoctorProfileByDoctor(UserEntity user);
}
