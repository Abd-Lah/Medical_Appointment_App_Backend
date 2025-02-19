package com.spring.demo_relationship.repository;

import com.spring.demo_relationship.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoPatient extends JpaRepository<Patient, Integer> {

}
