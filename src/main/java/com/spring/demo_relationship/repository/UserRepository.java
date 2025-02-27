package com.spring.demo_relationship.repository;

import com.spring.demo_relationship.models.DoctorProfile;
import com.spring.demo_relationship.models.Role;
import com.spring.demo_relationship.models.UserEntity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String>, JpaSpecificationExecutor<UserEntity> {
    UserEntity findByEmail(String email);

    Page<UserEntity> findUsersByRole(Role role, Pageable pageable);

    default Page<UserEntity> getDoctors(String firstName, String lastName, String city, String specialization, Pageable pageable) {
        return findAll((root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();

            Join<UserEntity, DoctorProfile> doctorProfileJoin = root.join("doctorProfile", JoinType.INNER);

            if (firstName != null && !firstName.isEmpty()) {
                predicates.add(builder.like(builder.lower(root.get("firstName")), "%" + firstName.toLowerCase() + "%"));
            }

            if (lastName != null && !lastName.isEmpty()) {
                predicates.add(builder.like(builder.lower(root.get("lastName")), "%" + lastName.toLowerCase() + "%"));
            }

            if (city != null && !city.isEmpty()) {
                predicates.add(builder.like(builder.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
            }

            if (specialization != null && !specialization.isEmpty()) {
                predicates.add(builder.like(builder.lower(doctorProfileJoin.get("specialty")), "%" + specialization.toLowerCase() + "%"));
            }

            predicates.add(builder.equal(root.get("role"), Role.DOCTOR));

            return builder.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

}
