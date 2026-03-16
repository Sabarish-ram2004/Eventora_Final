package com.eventora.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ⭐ VERY IMPORTANT FIX
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(length = 500)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceCategory category;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "cover_banner_url")
    private String coverBannerUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    private String phone;
    private String email;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 10)
    private String pincode;

    @Column(name = "google_maps_link")
    private String googleMapsLink;

    @Column(name = "starting_price", precision = 12, scale = 2)
    private BigDecimal startingPrice;

    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VendorStatus status = VendorStatus.PENDING_APPROVAL;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Builder.Default
    private Integer totalReviews = 0;

    @Builder.Default
    private Integer totalBookings = 0;

    @Builder.Default
    private Integer successfulBookings = 0;

    @Builder.Default
    private Integer wishlistCount = 0;

    @Builder.Default
    private BigDecimal avgResponseTimeHours = BigDecimal.valueOf(24);

    @Builder.Default
    private Integer profileCompletionScore = 0;

    @Builder.Default
    private BigDecimal aiPopularityScore = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal overallRankingScore = BigDecimal.ZERO;

    // ⭐ JSON fields safe
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> amenities;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_subtypes", columnDefinition = "jsonb")
    private List<String> serviceSubtypes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum VendorStatus {
        PENDING_APPROVAL, ACTIVE, SUSPENDED, REJECTED
    }

    public enum ServiceCategory {
        HALL, CATERING, DECORATION, PHOTOGRAPHY,
        DJ_MUSIC, TRANSPORT, BEAUTICIAN, TAILOR, FULL_EVENT_HANDLER
    }
}