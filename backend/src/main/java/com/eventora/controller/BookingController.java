package com.eventora.controller;

import com.eventora.model.User;
import com.eventora.model.Vendor;
import com.eventora.repository.UserRepository;
import com.eventora.repository.VendorRepository;
import com.eventora.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createBooking(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody Map<String, Object> data) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(bookingService.createBooking(userId, data));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        UUID userId = getUserId(userDetails);
        return ResponseEntity.ok(bookingService.getUserBookings(userId, page, size));
    }

    @GetMapping("/vendor-bookings")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> getVendorBookings(@AuthenticationPrincipal UserDetails userDetails,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        UUID userId = getUserId(userDetails);
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return ResponseEntity.ok(bookingService.getVendorBookings(vendor.getId(), page, size));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id,
                                           @AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody Map<String, String> body) {
        UUID userId = getUserId(userDetails);
        Vendor vendor = vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, vendor.getId(),
                body.get("status"), body.get("notes")));
    }

    @GetMapping("/reference/{ref}")
    public ResponseEntity<?> getByReference(@PathVariable String ref) {
        return ResponseEntity.ok(bookingService.getBookingByReference(ref));
    }

    private UUID getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
