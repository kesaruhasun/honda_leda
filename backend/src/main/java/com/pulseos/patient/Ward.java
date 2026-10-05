package com.pulseos.patient;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "wards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ward_id")
    private Long wardId;

    @Column(name = "ward_name", length = 100, nullable = false, unique = true)
    private String wardName;

    @Enumerated(EnumType.STRING)
    @Column(name = "ward_type", length = 30, nullable = false)
    private WardType wardType;

    @Column(name = "bed_capacity", nullable = false)
    private Integer bedCapacity;

    @Column(name = "current_occupancy", nullable = false)
    private Integer currentOccupancy = 0;
}
