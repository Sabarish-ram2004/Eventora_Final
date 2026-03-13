package com.eventora.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

// ========================= VendorGallery =========================
@Entity
@Table(name = "vendor_gallery")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class VendorGallery {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    private String caption;
    @Builder.Default
    private boolean primary = false;
    @Builder.Default
    private int displayOrder = 0;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}

// ========================= VendorAmenity =========================
@Entity
@Table(name = "vendor_amenities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class VendorAmenity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(nullable = false, length = 100)
    private String amenityName;

    private String icon;

    @CreationTimestamp
    private LocalDateTime createdAt;
}

// ========================= Like =========================
@Entity
@Table(name = "likes",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "vendor_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
class Like {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
