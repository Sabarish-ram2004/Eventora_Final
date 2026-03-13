package com.eventora.controller;

import com.eventora.model.User;
import com.eventora.model.Vendor;
import com.eventora.repository.UserRepository;
import com.eventora.service.VendorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequiredArgsConstructor
public class VendorController {
    private final VendorService vendorService;
    private final UserRepository userRepository;

    @GetMapping("/public/vendors")
    public ResponseEntity<?> getVendors(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Vendor.ServiceCategory cat = category != null ? Vendor.ServiceCategory.valueOf(category) : null;
        return ResponseEntity.ok(vendorService.getVendors(cat, city, minPrice, maxPrice, minRating, page, size));
    }

    @GetMapping("/public/vendors/{id}")
    public ResponseEntity<?> getVendor(@PathVariable UUID id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @GetMapping("/public/vendors/top")
    public ResponseEntity<?> getTopVendors(
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(vendorService.getTopVendors(city, limit));
    }

    @PostMapping("/vendor/profile")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> createProfile(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody Map<String, Object> data) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(vendorService.createVendorProfile(userId, data));
    }

    @PutMapping("/vendor/profile")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody Map<String, Object> data) {
        UUID userId = getUserId(userDetails);
        Vendor vendor = vendorService.getVendorByUserId(userId);
        return ResponseEntity.ok(vendorService.updateVendorProfile(vendor.getId(), data));
    }

    @GetMapping("/vendor/profile")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(vendorService.getVendorByUserId(userId));
    }

    @GetMapping("/vendor/stats")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        Vendor vendor = vendorService.getVendorByUserId(userId);
        return ResponseEntity.ok(vendorService.getVendorStats(vendor.getId()));
    }

    @PostMapping("/admin/vendors/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveVendor(@PathVariable UUID id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        UUID adminId = getUserId(userDetails);
        return ResponseEntity.ok(vendorService.approveVendor(id, adminId));
    }

    @PostMapping("/admin/vendors/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectVendor(@PathVariable UUID id,
                                           @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(vendorService.rejectVendor(id, body.get("reason")));
    }

    private UUID getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
