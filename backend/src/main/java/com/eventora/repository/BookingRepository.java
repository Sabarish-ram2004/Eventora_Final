package com.eventora.repository;

import com.eventora.model.enums.BookingStatus;

import com.eventora.model.Booking;
import com.eventora.model.ServiceCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    // ⭐ USER BOOKINGS PAGINATION
    @EntityGraph(attributePaths = { "vendor", "category", "service" })
    Page<Booking> findByUser_IdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    // ⭐ VENDOR BOOKINGS PAGINATION
    @EntityGraph(attributePaths = { "user", "category", "service" })
    Page<Booking> findByVendor_IdOrderByCreatedAtDesc(UUID vendorId, Pageable pageable);

    Optional<Booking> findByBookingReference(String ref);

    // ⭐ USER DOUBLE BOOKING CHECK
    @Query("""
            SELECT COUNT(b) > 0
            FROM Booking b
            WHERE b.user.id = :userId
            AND b.category = :category
            AND b.eventDate = :date
            AND b.status NOT IN :excluded
            """)
    boolean userHasBookingOnDate(
            UUID userId,
            ServiceCategory category,
            LocalDate date,
            List<BookingStatus> excluded);

    // ⭐ VENDOR SLOT EXISTS CHECK (optimized)
    @Query("""
            SELECT COUNT(b) > 0
            FROM Booking b
            WHERE b.vendor.id = :vendorId
            AND b.eventDate = :date
            AND b.status NOT IN ('CANCELLED','REJECTED')
            """)
    boolean vendorHasBookingOnDate(
            @Param("vendorId") UUID vendorId,
            @Param("date") LocalDate date);

    // ⭐ TOTAL EARNINGS (only PAID + COMPLETED)
    @Query("""
            SELECT COALESCE(SUM(b.finalPrice),0)
            FROM Booking b
            WHERE b.vendor.id = :vendorId
            AND b.status = 'COMPLETED'
            AND b.paymentStatus = 'PAID'
            AND b.eventDate >= :from
            """)
    BigDecimal getTotalEarnings(
            @Param("vendorId") UUID vendorId,
            @Param("from") LocalDate from);

    long countByStatus(BookingStatus status);

    long count();
}