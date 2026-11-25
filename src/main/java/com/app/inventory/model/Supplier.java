package com.app.inventory.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a Supplier.
 */
@Entity
@Table(name = "supplier")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "phone_number")
    private String phoneNumber;
}
