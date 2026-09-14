package com.pulseos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(name = "supplier_name", length = 100, nullable = false)
    private String supplierName;

    @Column(name = "email", length = 100, nullable = false)
    private String email;

    @Column(name = "street", length = 100)
    private String street;

    @Column(name = "city", length = 50, nullable = false)
    private String city;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "supplier_phones", joinColumns = @JoinColumn(name = "supplier_id"))
    @Column(name = "phone_number", length = 20, nullable = false)
    private Set<String> phoneNumbers = new HashSet<>();
}
