package com.app.inventory.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a physical Warehouse location.
 */
@Entity
@Table(name = "warehouse")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String location;
}
