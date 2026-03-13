package com.eventora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventora.model.Vendor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorRankingService {

    // private final VendorRepository vendorRepository;

    /**
     * AI RANKING SCORE FORMULA
     * Score = W1*Rating + W2*Bookings + W3*Wishlist + W4*ResponseTime + W5*Price + W6*Completeness + W7*Popularity
     *
     * Weights (sum = 1.0):
     * W1 = 0.25 (Rating)
     * W2 = 0.20 (Booking success rate)
     * W3 = 0.10 (Wishlist adds)
     * W4 = 0.15 (Response time - lower is better)
     * W5 = 0.10 (Price competitiveness)
     * W6 = 0.10 (Profile completeness)
     * W7 = 0.10 (AI popularity prediction)
     */
    @Transactional
    public BigDecimal calculateRankingScore(Vendor vendor,
                                            double avgRating,
                                            int reviewCount,
                                            int wishlistCount,
                                            int likesCount,
                                            double avgCategoryPrice) {
        // ---- Rating Component (0-25) ----
        double ratingScore = (avgRating / 5.0) * 25;

        // ---- Booking Success Component (0-20) ----
        double bookingRate = vendor.getTotalBookings() > 0
            ? (double) vendor.getSuccessfulBookings() / vendor.getTotalBookings()
            : 0;
        double bookingScore = bookingRate * 20;
        // Volume bonus: more bookings = more reliable
        double volumeBonus = Math.min(vendor.getTotalBookings() / 100.0, 1.0) * 5;
        bookingScore = Math.min(bookingScore + volumeBonus, 20);

        // ---- Wishlist Component (0-10) ----
        double wishlistScore = Math.min(wishlistCount / 50.0, 1.0) * 10;

        // ---- Response Time Component (0-15) — lower hours = higher score ----
        double responseHours = vendor.getAvgResponseTimeHours() != null
            ? vendor.getAvgResponseTimeHours().doubleValue() : 24;
        double responseScore;
        if (responseHours <= 1) responseScore = 15;
        else if (responseHours <= 3) responseScore = 13;
        else if (responseHours <= 6) responseScore = 11;
        else if (responseHours <= 12) responseScore = 8;
        else if (responseHours <= 24) responseScore = 5;
        else responseScore = 2;

        // ---- Price Competitiveness Component (0-10) ----
        double priceScore = 5; // default neutral
        if (vendor.getStartingPrice() != null && avgCategoryPrice > 0) {
            double priceRatio = vendor.getStartingPrice().doubleValue() / avgCategoryPrice;
            if (priceRatio < 0.7) priceScore = 10; // significantly cheaper
            else if (priceRatio < 0.9) priceScore = 8;
            else if (priceRatio < 1.1) priceScore = 6;
            else if (priceRatio < 1.3) priceScore = 4;
            else priceScore = 2;
        }

        // ---- Profile Completeness Component (0-10) ----
        int completionScore = calculateProfileCompletion(vendor);
        vendor.setProfileCompletionScore(completionScore);
        double completenessScore = (completionScore / 100.0) * 10;

        // ---- AI Popularity Prediction Component (0-10) ----
        // Combines likes, reviews engagement, and recency
        double popularityScore = 0;
        popularityScore += Math.min(likesCount / 20.0, 0.4) * 10;
        popularityScore += Math.min(reviewCount / 30.0, 0.4) * 10;
        // Featured vendors get a small boost
        // if (vendor.isFeatured()) popularityScore = Math.min(popularityScore + 2, 10);

        // ---- Final Score ----
        double totalScore = ratingScore + bookingScore + wishlistScore + responseScore
            + priceScore + completenessScore + popularityScore;

        // Normalize to 0-100
        double normalizedScore = Math.min(totalScore, 100);

        log.debug("Ranking for vendor {}: rating={}, booking={}, wishlist={}, response={}, price={}, completeness={}, popularity={} → TOTAL={}",
            vendor.getId(), ratingScore, bookingScore, wishlistScore, responseScore,
            priceScore, completenessScore, popularityScore, normalizedScore);

        return BigDecimal.valueOf(normalizedScore).setScale(4, RoundingMode.HALF_UP);
    }

    public int calculateProfileCompletion(Vendor vendor) {
        int score = 0;
        if (vendor.getBusinessName() != null && !vendor.getBusinessName().isBlank()) score += 10;
        if (vendor.getDescription() != null && vendor.getDescription().length() > 50) score += 15;
        if (vendor.getLogoUrl() != null) score += 10;
        if (vendor.getCoverBannerUrl() != null) score += 10;
        if (vendor.getPhone() != null) score += 5;
        // if (vendor.getWhatsapp() != null) score += 5;
        if (vendor.getAddress() != null) score += 5;
        if (vendor.getCity() != null) score += 5;
        if (vendor.getStartingPrice() != null) score += 10;
        // if (vendor.getGallery() != null && vendor.getGallery().size() >= 3) score += 10;
        if (vendor.getAmenities() != null && !vendor.getAmenities().isEmpty()) score += 5;
        // if (vendor.getServices() != null && !vendor.getServices().isEmpty()) score += 10;
        return Math.min(score, 100);
    }

    // @Scheduled(fixedDelay = 3600000) // Every hour
    // @Transactional
    // public void recalculateAllRankings() {
    //     log.info("Starting AI ranking recalculation for all vendors...");
    //     List<Vendor> vendors = vendorRepository.findAllApprovedActive();
    //     vendors.forEach(vendor -> {
    //         // Fetch aggregates from DB
    //         var stats = vendorRepository.findVendorStats(vendor.getId());
    //         if (stats != null) {
    //             double avgCategoryPrice = vendorRepository.findAvgPriceByCategory(vendor.getCategory().getId());
    //             BigDecimal score = calculateRankingScore(
    //                 vendor,
    //                 stats.getAvgRating(),
    //                 stats.getReviewCount(),
    //                 stats.getWishlistCount(),
    //                 stats.getLikesCount(),
    //                 avgCategoryPrice
    //             );
    //             vendor.setAiRankingScore(score);
    //             vendorRepository.save(vendor);
    //         }
    //     });
    //     log.info("Ranking recalculation complete for {} vendors", vendors.size());
    // }
}
