package com.ganesh.aisoilhealthassessment.repository;

import com.ganesh.aisoilhealthassessment.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findUserByUsername(String userName);
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    void removeUsersById(UUID id);
}
