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
@Table(name = "vendor_services")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VendorService {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "price_unit")
    @Builder.Default
    private String priceUnit = "per event";

    @Column(name = "duration_hours")
    private Integer durationHours;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "min_order")
    @Builder.Default
    private Integer minOrder = 1;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> features;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> images;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "occasion_types", columnDefinition = "jsonb")
    private List<String> occasionTypes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
