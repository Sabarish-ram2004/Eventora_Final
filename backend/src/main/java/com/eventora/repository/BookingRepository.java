package com.eventora.repository;

import com.eventora.model.Booking;
import com.eventora.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Page<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    Page<Booking> findByVendorIdOrderByCreatedAtDesc(UUID vendorId, Pageable pageable);
    Optional<Booking> findByBookingReference(String ref);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.user.id = :userId AND b.category = :category AND b.eventDate = :date AND b.status NOT IN ('CANCELLED','REJECTED')")
    boolean userHasBookingOnDate(@Param("userId") UUID userId, @Param("category") Vendor.ServiceCategory category, @Param("date") LocalDate date);

    List<Booking> findByVendorIdAndEventDateAndStatusNotIn(UUID vendorId, LocalDate date, List<Booking.BookingStatus> statuses);

    @Query("SELECT SUM(b.finalPrice) FROM Booking b WHERE b.vendor.id = :vendorId AND b.status = 'COMPLETED' AND b.eventDate >= :from")
    BigDecimal getTotalEarnings(@Param("vendorId") UUID vendorId, @Param("from") LocalDate from);

    long countByStatus(Booking.BookingStatus status);
    long count();
}
