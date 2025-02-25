package com.spring.demo_relationship.repository;

import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, String> {
    DoctorProfile getDoctorProfileByDoctor(UserEntity user);
}
