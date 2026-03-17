package com.eventora.controller;

import com.eventora.dto.booking.CreateBookingRequest;
import com.eventora.dto.booking.UpdateBookingStatusRequest;
import com.eventora.dto.common.ApiResponse;
import com.eventora.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<?>> createBooking(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody CreateBookingRequest request) {

        return ResponseEntity.ok(
                bookingService.createBooking(user.getUsername(), request)
        );
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<?>> myBookings(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                bookingService.getUserBookings(user.getUsername(), page, size)
        );
    }

    @GetMapping("/vendor-bookings")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<?>> vendorBookings(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                bookingService.getVendorBookings(user.getUsername(), page, size)
        );
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody UpdateBookingStatusRequest request) {

        return ResponseEntity.ok(
                bookingService.updateBookingStatus(
                        id,
                        user.getUsername(),
                        request
                )
        );
    }

    @GetMapping("/reference/{ref}")
    public ResponseEntity<ApiResponse<?>> byReference(@PathVariable String ref) {
        return ResponseEntity.ok(
                bookingService.getBookingByReference(ref)
        );
    }
}