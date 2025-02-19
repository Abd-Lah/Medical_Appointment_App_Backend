package com.spring.demo_relationship.repository;

import com.spring.demo_relationship.model.Medcin;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepoMedcin extends JpaRepository<Medcin, Integer> {
}
