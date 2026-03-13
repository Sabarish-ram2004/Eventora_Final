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

    @Query("""
        SELECT v FROM Vendor v WHERE v.status = com.eventora.model.Vendor.VendorStatus.ACTIVE
        AND (:category IS NULL OR v.category = :category)
        AND (:city IS NULL OR LOWER(v.city) LIKE LOWER(CONCAT('%',:city,'%')))
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
        Pageable pageable);

    @Query("SELECT v FROM Vendor v WHERE v.status = com.eventora.model.Vendor.VendorStatus.ACTIVE ORDER BY v.overallRankingScore DESC")
    List<Vendor> findTopRankedVendors(Pageable pageable);

    @Query("SELECT v FROM Vendor v WHERE v.status = com.eventora.model.Vendor.VendorStatus.ACTIVE AND LOWER(v.city) = LOWER(:city) ORDER BY v.overallRankingScore DESC")
    List<Vendor> findTopVendorsByCity(@Param("city") String city, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Vendor v SET v.overallRankingScore = (
            v.avgRating * 0.25 +
            (COALESCE(v.successfulBookings, 0) * 0.001 * 20) +
            (COALESCE(v.wishlistCount, 0) * 0.001 * 10) +
            (CASE WHEN v.avgResponseTimeHours <= 2 THEN 10 WHEN v.avgResponseTimeHours <= 6 THEN 7 ELSE 3 END * 0.15) +
            (v.profileCompletionScore * 0.001 * 10) +
            (v.aiPopularityScore * 0.20)
        ) WHERE v.status = com.eventora.model.Vendor.VendorStatus.ACTIVE
        """)
    void updateAllRankingScores();

    long countByStatus(Vendor.VendorStatus status);
}
