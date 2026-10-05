package com.pulseos.common;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "receptionists")
@PrimaryKeyJoinColumn(name = "employee_id", referencedColumnName = "employee_id")
@DiscriminatorValue("RECEPTIONIST")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Receptionist extends Employee {

    @Column(name = "desk_number", length = 20, nullable = false)
    private String deskNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "shift_block", length = 20, nullable = false)
    private ShiftBlock shiftBlock;
}
