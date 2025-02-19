package com.spring.demo_relationship.repository;

import com.spring.demo_relationship.model.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoConsultation extends JpaRepository<Consultation, Integer> {
}
