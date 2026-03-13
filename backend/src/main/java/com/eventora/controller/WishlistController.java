package com.eventora.controller;

import com.eventora.exception.EventoraException;
import com.eventora.model.User;
import com.eventora.model.Vendor;
import com.eventora.model.Wishlist;
import com.eventora.repository.UserRepository;
import com.eventora.repository.VendorRepository;
import com.eventora.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    @PostMapping("/toggle/{vendorId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> toggleWishlist(@PathVariable UUID vendorId,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> EventoraException.notFound("User not found"));

        if (wishlistRepository.existsByUserIdAndVendorId(user.getId(), vendorId)) {
            wishlistRepository.deleteByUserIdAndVendorId(user.getId(), vendorId);
            return ResponseEntity.ok(Map.of("wishlisted", false, "message", "Removed from wishlist"));
        } else {
            Vendor vendor = vendorRepository.findById(vendorId)
                    .orElseThrow(() -> EventoraException.notFound("Vendor not found"));
            Wishlist wishlist = Wishlist.builder().user(user).vendor(vendor).build();
            wishlistRepository.save(wishlist);
            return ResponseEntity.ok(Map.of("wishlisted", true, "message", "Added to wishlist"));
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getWishlist(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> EventoraException.notFound("User not found"));
        return ResponseEntity.ok(wishlistRepository.findByUserId(user.getId()));
    }
}
