package com.eventora.dto.booking;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotNull(message = "Vendor is required")
    private UUID vendorId;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDate eventDate;

    @NotBlank(message = "Venue address is required")
    @Size(max = 500, message = "Venue address too long")
    private String venueAddress;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}