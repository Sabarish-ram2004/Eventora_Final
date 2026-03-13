package com.eventora.repository;

import com.eventora.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.email = :val OR u.username = :val")
    Optional<User> findByEmailOrUsername(@Param("val") String emailOrUsername, @Param("val") String dup);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
