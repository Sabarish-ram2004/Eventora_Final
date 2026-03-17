package com.eventora.service;

import com.eventora.dto.booking.CreateBookingRequest;
import com.eventora.dto.booking.UpdateBookingStatusRequest;
import com.eventora.dto.common.ApiResponse;
import com.eventora.exception.EventoraException;
import com.eventora.model.Booking;
import com.eventora.model.ServiceCategory;
import com.eventora.model.User;
import com.eventora.model.Vendor;
import com.eventora.repository.BookingRepository;
//import com.eventora.repository.ServiceCategoryRepository;
import com.eventora.repository.UserRepository;
import com.eventora.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    //private final ServiceCategoryRepository categoryRepository;

    // ⭐ CREATE BOOKING
    @Transactional
    public ApiResponse<String> createBooking(String username, CreateBookingRequest request) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> EventoraException.notFound("Vendor not found"));

        if (vendor.getStatus() != Vendor.VendorStatus.ACTIVE) {
            throw EventoraException.badRequest("Vendor is not accepting bookings");
        }

        ServiceCategory category = vendor.getCategory();

        // ⭐ duplicate booking rule
        if (bookingRepository.userHasBookingOnDate(
                user.getId(),
                category,
                request.getEventDate())) {

            throw EventoraException.conflict(
                    "You already have a booking in this category on selected date");
        }

        // ⭐ vendor slot check
        boolean vendorBusy =
                bookingRepository.vendorHasBookingOnDate(
                        vendor.getId(),
                        request.getEventDate()
                );

        Booking.BookingStatus status =
                vendorBusy
                        ? Booking.BookingStatus.WAITLISTED
                        : Booking.BookingStatus.PENDING;

        Booking booking = Booking.builder()
                .user(user)
                .vendor(vendor)
                .category(category)
                .eventDate(request.getEventDate())
                .venueAddress(request.getVenueAddress())
                .specialRequirements(request.getNotes())
                .status(status)
                .build();

        bookingRepository.save(booking);

        // ⭐ null safe increment
        vendor.setTotalBookings(
                vendor.getTotalBookings() == null
                        ? 1
                        : vendor.getTotalBookings() + 1
        );

        vendorRepository.save(vendor);

        return ApiResponse.success(
                "Booking created successfully",
                booking.getBookingReference()
        );
    }

    // ⭐ UPDATE BOOKING STATUS
    @Transactional
    public ApiResponse<String> updateBookingStatus(
            UUID bookingId,
            String username,
            UpdateBookingStatusRequest request) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> EventoraException.notFound("Booking not found"));

        if (!booking.getVendor().getUser().getUsername().equals(username)) {
            throw EventoraException.forbidden("Not allowed");
        }

        Booking.BookingStatus newStatus =
                Booking.BookingStatus.valueOf(request.getStatus());

        Booking.BookingStatus current = booking.getStatus();

        // ⭐ state machine validation
        if (current == Booking.BookingStatus.COMPLETED ||
                current == Booking.BookingStatus.CANCELLED ||
                current == Booking.BookingStatus.REJECTED) {
            throw EventoraException.badRequest("Booking already finalized");
        }

        booking.setStatus(newStatus);
        booking.setVendorNotes(request.getNotes());

        if (newStatus == Booking.BookingStatus.CONFIRMED) {
            booking.setConfirmedAt(LocalDateTime.now());
        }
        if (newStatus == Booking.BookingStatus.CANCELLED) {
            booking.setCancelledAt(LocalDateTime.now());
        }
        if (newStatus == Booking.BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
        }

        bookingRepository.save(booking);

        return ApiResponse.success("Booking status updated");
    }

    // ⭐ USER BOOKINGS
    public ApiResponse<Page<Booking>> getUserBookings(String username, int page, int size) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        Page<Booking> bookings =
                bookingRepository.findByUser_IdOrderByCreatedAtDesc(
                        user.getId(),
                        PageRequest.of(page, size)
                );

        return ApiResponse.success(bookings);
    }

    // ⭐ VENDOR BOOKINGS
    public ApiResponse<Page<Booking>> getVendorBookings(String username, int page, int size) {

        Vendor vendor = vendorRepository.findByUserUsername(username)
                .orElseThrow(() -> EventoraException.notFound("Vendor not found"));

        Page<Booking> bookings =
                bookingRepository.findByVendor_IdOrderByCreatedAtDesc(
                        vendor.getId(),
                        PageRequest.of(page, size)
                );

        return ApiResponse.success(bookings);
    }

    // ⭐ GET BOOKING BY REF
    public ApiResponse<Booking> getBookingByReference(String reference) {

        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> EventoraException.notFound("Booking not found"));

        return ApiResponse.success(booking);
    }

    // ⭐ VENDOR EARNINGS
    public ApiResponse<EarningsDto> getVendorEarnings(String username) {

        Vendor vendor = vendorRepository.findByUserUsername(username)
                .orElseThrow(() -> EventoraException.notFound("Vendor not found"));

        LocalDate month = LocalDate.now().minusMonths(1);
        LocalDate year = LocalDate.now().minusYears(1);

        BigDecimal monthly =
                bookingRepository.getTotalEarnings(vendor.getId(), month);

        BigDecimal yearly =
                bookingRepository.getTotalEarnings(vendor.getId(), year);

        return ApiResponse.success(
                "Vendor earnings fetched",
                new EarningsDto(monthly, yearly)
        );
    }

    public record EarningsDto(BigDecimal monthly, BigDecimal yearly) {}
}