package com.eventora.repository;

import com.eventora.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, UUID> {
    List<Wishlist> findByUserId(UUID userId);
    Optional<Wishlist> findByUserIdAndVendorId(UUID userId, UUID vendorId);
    boolean existsByUserIdAndVendorId(UUID userId, UUID vendorId);
    void deleteByUserIdAndVendorId(UUID userId, UUID vendorId);
}
