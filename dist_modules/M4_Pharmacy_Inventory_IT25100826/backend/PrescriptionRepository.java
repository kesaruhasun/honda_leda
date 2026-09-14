package com.pulseos.repository;

import com.pulseos.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatientId(Long patientId);
    List<Prescription> findByAppointmentAppointmentId(Long appointmentId);
    List<Prescription> findByDoctorId(Long doctorId);
    java.util.Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);
}
