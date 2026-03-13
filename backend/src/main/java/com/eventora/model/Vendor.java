package com.eventora.model;

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
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vendor {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
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

    @Column(length = 3)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VendorStatus status = VendorStatus.PENDING_APPROVAL;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "total_bookings")
    @Builder.Default
    private Integer totalBookings = 0;

    @Column(name = "successful_bookings")
    @Builder.Default
    private Integer successfulBookings = 0;

    @Column(name = "wishlist_count")
    @Builder.Default
    private Integer wishlistCount = 0;

    @Column(name = "avg_response_time_hours", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal avgResponseTimeHours = BigDecimal.valueOf(24);

    @Column(name = "profile_completion_score")
    @Builder.Default
    private Integer profileCompletionScore = 0;

    @Column(name = "ai_popularity_score", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal aiPopularityScore = BigDecimal.ZERO;

    @Column(name = "overall_ranking_score", precision = 8, scale = 4)
    @Builder.Default
    private BigDecimal overallRankingScore = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> amenities;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_subtypes", columnDefinition = "jsonb")
    private List<String> serviceSubtypes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
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

    public enum VendorStatus { PENDING_APPROVAL, ACTIVE, SUSPENDED, REJECTED }
    public enum ServiceCategory {
        HALL, CATERING, DECORATION, PHOTOGRAPHY,
        DJ_MUSIC, TRANSPORT, BEAUTICIAN, TAILOR, FULL_EVENT_HANDLER
    }
}
