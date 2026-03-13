package com.eventora.service;

import com.eventora.exception.EventoraException;
import com.eventora.model.*;
import com.eventora.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    private final BookingRepository bookingRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    @Transactional
    public Booking createBooking(UUID userId, Map<String, Object> data) {
        UUID vendorId = UUID.fromString((String) data.get("vendorId"));
        LocalDate eventDate = LocalDate.parse((String) data.get("eventDate"));
        Vendor.ServiceCategory category = Vendor.ServiceCategory.valueOf((String) data.get("category"));

        // Check duplicate booking rule
        if (bookingRepository.userHasBookingOnDate(userId, category, eventDate)) {
            throw EventoraException.conflict(
                    "You already have a " + category.name() + " booking on " + eventDate +
                    ". You cannot book the same service category twice on the same date.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> EventoraException.notFound("User not found"));
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> EventoraException.notFound("Vendor not found"));

        if (vendor.getStatus() != Vendor.VendorStatus.ACTIVE) {
            throw EventoraException.badRequest("Vendor is not available for bookings");
        }

        // Check vendor availability
        List<Booking> existingBookings = bookingRepository.findByVendorIdAndEventDateAndStatusNotIn(
                vendorId, eventDate, List.of(Booking.BookingStatus.CANCELLED, Booking.BookingStatus.REJECTED));

        Booking booking = Booking.builder()
                .user(user)
                .vendor(vendor)
                .category(category)
                .eventDate(eventDate)
                .occasion(data.get("occasion") != null ?
                        Booking.OccasionType.valueOf((String) data.get("occasion")) : null)
                .guestCount(data.get("guestCount") != null ?
                        Integer.parseInt(data.get("guestCount").toString()) : null)
                .venueAddress((String) data.get("venueAddress"))
                .specialRequirements((String) data.get("specialRequirements"))
                .quotedPrice(data.get("quotedPrice") != null ?
                        new BigDecimal(data.get("quotedPrice").toString()) : null)
                .status(existingBookings.size() >= 1 ?
                        Booking.BookingStatus.WAITLISTED : Booking.BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        // Update vendor booking count
        vendor.setTotalBookings(vendor.getTotalBookings() + 1);
        vendorRepository.save(vendor);

        return booking;
    }

    @Transactional
    public Booking updateBookingStatus(UUID bookingId, UUID vendorId, String status, String notes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> EventoraException.notFound("Booking not found"));

        if (!booking.getVendor().getId().equals(vendorId)) {
            throw EventoraException.forbidden("Not authorized to manage this booking");
        }

        Booking.BookingStatus newStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
        booking.setStatus(newStatus);
        booking.setVendorNotes(notes);

        if (newStatus == Booking.BookingStatus.CONFIRMED) {
            booking.setConfirmedAt(LocalDateTime.now());
            Vendor vendor = booking.getVendor();
            vendor.setSuccessfulBookings(vendor.getSuccessfulBookings() + 1);
            vendorRepository.save(vendor);
        } else if (newStatus == Booking.BookingStatus.CANCELLED) {
            booking.setCancelledAt(LocalDateTime.now());
        } else if (newStatus == Booking.BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
        }

        return bookingRepository.save(booking);
    }

    public Page<Booking> getUserBookings(UUID userId, int page, int size) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public Page<Booking> getVendorBookings(UUID vendorId, int page, int size) {
        return bookingRepository.findByVendorIdOrderByCreatedAtDesc(vendorId, PageRequest.of(page, size));
    }

    public Booking getBookingByReference(String reference) {
        return bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> EventoraException.notFound("Booking not found"));
    }

    public Map<String, Object> getVendorEarnings(UUID vendorId) {
        LocalDate oneMonthAgo = LocalDate.now().minusMonths(1);
        LocalDate oneYearAgo = LocalDate.now().minusYears(1);
        BigDecimal monthlyEarnings = bookingRepository.getTotalEarnings(vendorId, oneMonthAgo);
        BigDecimal yearlyEarnings = bookingRepository.getTotalEarnings(vendorId, oneYearAgo);
        return Map.of(
                "monthlyEarnings", monthlyEarnings != null ? monthlyEarnings : BigDecimal.ZERO,
                "yearlyEarnings", yearlyEarnings != null ? yearlyEarnings : BigDecimal.ZERO
        );
    }
}
