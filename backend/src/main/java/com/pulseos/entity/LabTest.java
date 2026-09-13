package com.pulseos.entity;

import com.pulseos.entity.enums.LabTestStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Long testId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "clinical_indication", length = 255)
    private String clinicalIndication;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "technician_id")
    private LabTechnician technician;

    @Column(name = "conduction_date")
    private LocalDateTime conductionDate;

    @Column(name = "test_name", length = 100, nullable = false)
    private String testName;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "standard_fee", precision = 10, scale = 2, nullable = false)
    private BigDecimal standardFee;

    @Column(name = "test_date", nullable = false)
    private LocalDate testDate = LocalDate.now();

    @Column(name = "result_data", columnDefinition = "TEXT")
    private String resultData;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;

    @Column(name = "request_number", length = 50)
    private String requestNumber;

    @Column(name = "urgency", length = 30)
    private String urgency = "ROUTINE";

    @Column(name = "result_value")
    private Double resultValue;

    @Column(name = "flag", length = 20)
    private String flag;

    @Column(name = "unit", length = 30)
    private String unit;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "lab_test_catalog_id")
    private Long labTestCatalogId;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_status", length = 25, nullable = false)
    private LabTestStatus testStatus = LabTestStatus.REQUESTED;

    public LabTest(Long testId, Appointment appointment, Patient patient, Doctor doctor,
                   String clinicalIndication, LabTechnician technician, LocalDateTime conductionDate,
                   String testName, String category, BigDecimal standardFee, LocalDate testDate,
                   String resultData, String referenceRange, LabTestStatus testStatus) {
        this.testId = testId;
        this.appointment = appointment;
        this.patient = patient;
        this.doctor = doctor;
        this.clinicalIndication = clinicalIndication;
        this.technician = technician;
        this.conductionDate = conductionDate;
        this.testName = testName;
        this.category = category;
        this.standardFee = standardFee;
        this.testDate = testDate != null ? testDate : LocalDate.now();
        this.resultData = resultData;
        this.referenceRange = referenceRange;
        this.testStatus = testStatus != null ? testStatus : LabTestStatus.REQUESTED;
        this.urgency = "ROUTINE";
    }
}
