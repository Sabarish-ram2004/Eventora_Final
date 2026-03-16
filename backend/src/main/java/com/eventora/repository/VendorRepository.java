package com.eventora.repository;

import com.eventora.model.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID>, JpaSpecificationExecutor<Vendor> {

    Optional<Vendor> findByUserId(UUID userId);

    // ⭐ MAIN FILTER SEARCH (BEST VERSION)
    @Query("""
        SELECT v FROM Vendor v 
        WHERE v.status = :status
        AND (:category IS NULL OR v.category = :category)
        AND (:city IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%', :city, '%')))
        AND (:minPrice IS NULL OR v.startingPrice >= :minPrice)
        AND (:maxPrice IS NULL OR v.startingPrice <= :maxPrice)
        AND (:minRating IS NULL OR v.avgRating >= :minRating)
        ORDER BY v.overallRankingScore DESC
        """)
    Page<Vendor> findVendorsWithFilters(
            @Param("category") Vendor.ServiceCategory category,
            @Param("city") String city,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minRating") BigDecimal minRating,
            @Param("status") Vendor.VendorStatus status,
            Pageable pageable
    );

    // ⭐ TOP RANKED VENDORS
    @Query("""
        SELECT v FROM Vendor v 
        WHERE v.status = 'ACTIVE' 
        ORDER BY v.overallRankingScore DESC
        """)
    List<Vendor> findTopRankedVendors(Pageable pageable);

    // ⭐ TOP CITY VENDORS
    @Query("""
        SELECT v FROM Vendor v 
        WHERE v.status = 'ACTIVE' 
        AND LOWER(v.city) = LOWER(:city) 
        ORDER BY v.overallRankingScore DESC
        """)
    List<Vendor> findTopVendorsByCity(@Param("city") String city, Pageable pageable);

    // ⭐ UPDATE AI RANKING SCORE
    @Modifying
    @Query("""
        UPDATE Vendor v SET v.overallRankingScore = (
            v.avgRating * 0.25 +
            (COALESCE(v.successfulBookings, 0) * 0.02) +
            (COALESCE(v.wishlistCount, 0) * 0.01) +
            (CASE 
                WHEN v.avgResponseTimeHours <= 2 THEN 10
                WHEN v.avgResponseTimeHours <= 6 THEN 7
                ELSE 3
            END * 0.15) +
            (v.profileCompletionScore * 0.01) +
            (v.aiPopularityScore * 0.20)
        )
        WHERE v.status = 'ACTIVE'
        """)
    void updateAllRankingScores();

    long countByStatus(Vendor.VendorStatus status);
}