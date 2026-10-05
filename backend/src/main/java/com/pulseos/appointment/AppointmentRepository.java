package com.pulseos.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTime(Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime);
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime, AppointmentStatus status);
    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);
    List<Appointment> findByDoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime, AppointmentStatus status);
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, LocalDate appointmentDate, AppointmentStatus status);
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByStatus(AppointmentStatus status);
    java.util.Optional<Appointment> findByAppointmentNumber(String appointmentNumber);
}
