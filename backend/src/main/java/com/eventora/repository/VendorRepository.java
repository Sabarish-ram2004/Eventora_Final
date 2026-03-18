package com.eventora.repository;

import com.eventora.model.ServiceCategory;
import com.eventora.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import com.eventora.model.enums.VendorStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VendorRepository extends JpaRepository<Vendor, UUID>, JpaSpecificationExecutor<Vendor> {

    // ⭐ Find vendor by mapped userId
    Optional<Vendor> findByUserId(UUID userId);

    // ⭐ ⭐ IMPORTANT (THIS WAS MISSING → causing your error)
    Optional<Vendor> findByUserUsername(String username);

    // ⭐ MAIN SEARCH FILTER
    @Query("""
            SELECT v FROM Vendor v
            WHERE v.status = :status
            AND (:category IS NULL OR v.category = :category)
            AND (:city IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :city, '%')))
            AND (:minPrice IS NULL OR v.startingPrice >= :minPrice)
            AND (:maxPrice IS NULL OR v.startingPrice <= :maxPrice)
            AND (:minRating IS NULL OR v.avgRating >= :minRating)
            """)
    Page<Vendor> findVendorsWithFilters(
            @Param("category") ServiceCategory category,
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            @Param("status") VendorStatus status,
            Pageable pageable);

    // ⭐ TOP RANKED
    @Query("""
            SELECT v FROM Vendor v
            WHERE v.status = :status
            ORDER BY v.overallRankingScore DESC
            """)
    List<Vendor> findTopRankedVendors(
            @Param("status") VendorStatus status,
            Pageable pageable);

    // ⭐ TOP CITY
    @Query("""
            SELECT v FROM Vendor v
            WHERE v.status = :status
            AND LOWER(v.city) = LOWER(:city)
            ORDER BY v.overallRankingScore DESC
            """)
    List<Vendor> findTopVendorsByCity(
            @Param("city") String city,
            @Param("status") VendorStatus status,
            Pageable pageable);

    // ⭐ AI SCORE UPDATE
    @Query("""
            UPDATE Vendor v SET v.overallRankingScore = (
                (COALESCE(v.avgRating, 0) * 0.25) +
                (COALESCE(v.successfulBookings, 0) * 0.02) +
                (COALESCE(v.wishlistCount, 0) * 0.01) +
                (
                    CASE
                        WHEN v.avgResponseTimeHours IS NULL THEN 0
                        WHEN v.avgResponseTimeHours <= 2 THEN 10
                        WHEN v.avgResponseTimeHours <= 6 THEN 7
                        ELSE 3
                    END * 0.15
                ) +
                (COALESCE(v.profileCompletionScore, 0) * 0.01) +
                (COALESCE(v.aiPopularityScore, 0) * 0.20)
            )
            WHERE v.status = :status
            """)
    void updateAllRankingScores(@Param("status") VendorStatus status);
}