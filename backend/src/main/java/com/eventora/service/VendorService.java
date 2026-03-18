package com.eventora.service;

import com.eventora.exception.EventoraException;
import com.eventora.model.ServiceCategory;
import com.eventora.model.User;
import com.eventora.model.Vendor;
import com.eventora.repository.ServiceCategoryRepository;
import com.eventora.repository.UserRepository;
import com.eventora.repository.VendorRepository;
import com.eventora.model.enums.VendorStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ServiceCategoryRepository categoryRepository;

    @Transactional
    @SuppressWarnings("unchecked")
    public Vendor createVendorProfile(UUID userId, Map<String, Object> data) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        if (vendorRepository.findByUserId(userId).isPresent()) {
            throw EventoraException.conflict("Vendor profile already exists");
        }

        String categorySlug = (String) data.get("categorySlug");

        ServiceCategory category = categoryRepository.findBySlug(categorySlug)
                .orElseThrow(() -> EventoraException.notFound("Invalid category"));

        Vendor vendor = Vendor.builder()
                .user(user)
                .businessName((String) data.get("businessName"))
                .tagline((String) data.get("tagline"))
                .description((String) data.get("description"))
                .category(category)
                .phone((String) data.get("phone"))
                .email((String) data.get("email"))
                .address((String) data.get("address"))
                .city((String) data.get("city"))
                .pincode((String) data.get("pincode"))
                .googleMapsLink((String) data.get("googleMapsLink"))
                .startingPrice(data.get("startingPrice") != null
                        ? new BigDecimal(data.get("startingPrice").toString())
                        : null)
                .amenities((List<String>) data.getOrDefault("amenities", new ArrayList<>()))
                .serviceSubtypes((List<String>) data.getOrDefault("serviceSubtypes", new ArrayList<>()))
                .status(VendorStatus.PENDING_APPROVAL)
                .build();

        updateProfileCompletion(vendor);

        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor updateVendorProfile(UUID vendorId, Map<String, Object> data) {

        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> EventoraException.notFound("Vendor not found"));

        if (data.containsKey("businessName")) vendor.setBusinessName((String) data.get("businessName"));
        if (data.containsKey("tagline")) vendor.setTagline((String) data.get("tagline"));
        if (data.containsKey("description")) vendor.setDescription((String) data.get("description"));
        if (data.containsKey("phone")) vendor.setPhone((String) data.get("phone"));
        if (data.containsKey("email")) vendor.setEmail((String) data.get("email"));
        if (data.containsKey("address")) vendor.setAddress((String) data.get("address"));
        if (data.containsKey("city")) vendor.setCity((String) data.get("city"));
        if (data.containsKey("pincode")) vendor.setPincode((String) data.get("pincode"));

        updateProfileCompletion(vendor);

        return vendorRepository.save(vendor);
    }

    public Page<Vendor> getVendors(
            String categorySlug,
            String city,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            int page,
            int size) {

        Pageable pageable = PageRequest.of(page, size);

        ServiceCategory category = null;

        if (categorySlug != null && !categorySlug.isBlank()) {
            category = categoryRepository.findBySlug(categorySlug)
                    .orElseThrow(() -> EventoraException.notFound("Category not found"));
        }

        return vendorRepository.findVendorsWithFilters(
                category,
                city,
                minPrice,
                maxPrice,
                minRating,
                VendorStatus.ACTIVE,
                pageable
        );
    }

    public List<Vendor> getTopVendors(String city, int limit) {

        Pageable pageable = PageRequest.of(0, limit);

        if (city != null && !city.isBlank()) {
            return vendorRepository.findTopVendorsByCity(
                    city,
                    VendorStatus.ACTIVE,
                    pageable
            );
        }

        return vendorRepository.findTopRankedVendors(
                VendorStatus.ACTIVE,
                pageable
        );
    }

    public Vendor getVendorById(UUID id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> EventoraException.notFound("Vendor not found"));
    }

    public Vendor getVendorByUserId(UUID userId) {
        return vendorRepository.findByUserId(userId)
                .orElseThrow(() -> EventoraException.notFound("Vendor profile not found"));
    }

    @Transactional
    public Vendor approveVendor(UUID vendorId, UUID adminId) {

        Vendor vendor = getVendorById(vendorId);
        vendor.setStatus(VendorStatus.ACTIVE);
        vendor.setApprovedAt(java.time.LocalDateTime.now());

        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor rejectVendor(UUID vendorId, String reason) {

        Vendor vendor = getVendorById(vendorId);
        vendor.setStatus(VendorStatus.REJECTED);

        return vendorRepository.save(vendor);
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void recalculateRankingScores() {

        log.info("Recalculating vendor ranking scores...");
        vendorRepository.updateAllRankingScores(VendorStatus.ACTIVE);
        log.info("Ranking scores updated");
    }

    public Map<String, Object> getVendorStats(UUID vendorId) {

        Vendor vendor = getVendorById(vendorId);

        return Map.of(
                "avgRating", vendor.getAvgRating(),
                "totalReviews", vendor.getTotalReviews(),
                "totalBookings", vendor.getTotalBookings(),
                "successfulBookings", vendor.getSuccessfulBookings(),
                "wishlistCount", vendor.getWishlistCount(),
                "profileCompletion", vendor.getProfileCompletionScore(),
                "rankingScore", vendor.getOverallRankingScore()
        );
    }

    private void updateProfileCompletion(Vendor vendor) {

        int score = 0;

        if (vendor.getBusinessName() != null) score += 10;
        if (vendor.getDescription() != null) score += 15;
        if (vendor.getTagline() != null) score += 5;
        if (vendor.getPhone() != null) score += 10;
        if (vendor.getEmail() != null) score += 5;

        vendor.setProfileCompletionScore(score);
    }
}