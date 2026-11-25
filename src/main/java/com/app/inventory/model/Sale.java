package com.app.inventory.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Entity representing a Sale of a product, used to track date and quantity for
 * the Sales Trend Dashboard.
 */
@Entity
@Table(
    name = "sale",
    indexes = {
        @Index(name = "idx_sale_date", columnList = "sale_date")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;
}
