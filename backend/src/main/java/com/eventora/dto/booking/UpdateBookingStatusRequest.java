package com.eventora.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBookingStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "PENDING|CONFIRMED|REJECTED|CANCELLED|COMPLETED",
            message = "Invalid booking status"
    )
    private String status;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}