package com.eventora.repository;

import com.eventora.model.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {

    Optional<ServiceCategory> findBySlug(String slug);

    Optional<ServiceCategory> findByName(String name);

}