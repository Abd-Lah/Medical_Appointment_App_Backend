package com.spring.demo_relationship.repository;

import com.spring.demo_relationship.models.Role;
import com.spring.demo_relationship.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    UserEntity findByEmail(String email);

    List<UserEntity> findUsersByRole(Role role);

    @Query("SELECT u FROM UserEntity u WHERE u.firstName = :firstName " +
            "OR u.lastName = :lastName " +
            "OR u.city = :city " +
            "AND u.role = 'DOCTOR'")
    List<UserEntity> getDoctors(String firstName, String lastName, String city);
}
