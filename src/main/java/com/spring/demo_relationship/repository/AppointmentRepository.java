package com.spring.demo_relationship.repository;

import com.spring.demo_relationship.models.AppointmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity,String> {
}
