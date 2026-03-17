package com.eventora.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;
import com.eventora.model.enums.VendorStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "vendors",
        indexes = {
                @Index(name = "idx_vendor_city", columnList = "city"),
                @Index(name = "idx_vendor_status", columnList = "status"),
                @Index(name = "idx_vendor_category", columnList = "category_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(length = 500)
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logoUrl;
    private String coverBannerUrl;
    private String websiteUrl;
    private String phone;
    private String email;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 10)
    private String pincode;

    private String googleMapsLink;

    @Column(precision = 12, scale = 2)
    private BigDecimal startingPrice;

    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VendorStatus status = VendorStatus.PENDING_APPROVAL;

    @Builder.Default
    @Column(nullable = false)
    private Boolean verified = false;

    @Column(precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Builder.Default private Integer totalReviews = 0;
    @Builder.Default private Integer totalBookings = 0;
    @Builder.Default private Integer successfulBookings = 0;
    @Builder.Default private Integer wishlistCount = 0;

    @Builder.Default
    private BigDecimal avgResponseTimeHours = BigDecimal.valueOf(24);

    @Builder.Default private Integer profileCompletionScore = 0;
    @Builder.Default private BigDecimal aiPopularityScore = BigDecimal.ZERO;
    @Builder.Default private BigDecimal overallRankingScore = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> amenities;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_subtypes", columnDefinition = "jsonb")
    private List<String> serviceSubtypes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime approvedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}