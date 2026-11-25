package com.app.inventory.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing the Stock Level of a Product in a particular Warehouse.
 * Demonstrates multi-location tracking.
 */
@Entity
@Table(
    name = "stock_level",
    indexes = {
        @Index(name = "idx_product_id", columnList = "product_id"),
        @Index(name = "idx_warehouse_id", columnList = "warehouse_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "low_stock_threshold", nullable = false)
    private Integer lowStockThreshold;
}
