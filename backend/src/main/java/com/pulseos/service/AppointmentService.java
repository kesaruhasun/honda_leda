package com.pulseos.service;

import com.pulseos.common.exception.PulseException;
import com.pulseos.dto.AppointmentDTOs.*;
import com.pulseos.entity.Appointment;
import com.pulseos.entity.Doctor;
import com.pulseos.entity.Patient;
import com.pulseos.entity.enums.AppointmentStatus;
import com.pulseos.repository.AppointmentRepository;
import com.pulseos.repository.DoctorRepository;
import com.pulseos.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Appointment with ID " + id + " not found"));
        return toResponse(a);
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest req) {
        if (req.getPatientId() == null || req.getDoctorId() == null) {
            throw PulseException.badRequest("Validation Error", "Patient and Doctor IDs are required");
        }

        String dateStr = req.getAppointmentDate();
        String timeStr = req.getResolvedStartTime();
        if (dateStr == null || dateStr.isBlank() || timeStr == null || timeStr.isBlank()) {
            throw PulseException.badRequest("Validation Error", "Appointment date and time are required");
        }

        LocalDate date = LocalDate.parse(dateStr);
        LocalTime time = LocalTime.parse(timeStr);

        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> PulseException.notFound("Patient not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> PulseException.notFound("Doctor not found"));

        // Double-booking guard
        boolean conflicting = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTime(doctor.getId(), date, time);
        if (conflicting) {
            throw PulseException.conflict("Double Booking",
                    "Dr. " + doctor.getFullName() + " already has an appointment at " + date + " " + time);
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setEndTime(time.plusMinutes(15));
        appointment.setBookingDate(LocalDateTime.now());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setReasonForVisit(req.getResolvedReason() != null ? req.getResolvedReason() : "General Consultation");
        appointment.setRoomNumber(req.getRoomNumber() != null ? req.getRoomNumber() : doctor.getRoomNumber());
        appointment.setAppointmentNumber("APT-" + System.currentTimeMillis());

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Created appointment: ID={}, Patient={}, Doctor={}", saved.getAppointmentId(),
                patient.getFullName(), doctor.getFullName());
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse rescheduleAppointment(Long id, RescheduleRequest req) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Appointment not found"));

        if (a.getStatus() == AppointmentStatus.COMPLETED || a.getStatus() == AppointmentStatus.CANCELLED) {
            throw PulseException.badRequest("Invalid Status", "Cannot reschedule a " + a.getStatus() + " appointment");
        }

        LocalDate newDate = req.getAppointmentDate() != null ? LocalDate.parse(req.getAppointmentDate()) : a.getAppointmentDate();
        LocalTime newTime = req.getResolvedStartTime() != null ? LocalTime.parse(req.getResolvedStartTime()) : a.getAppointmentTime();

        boolean conflicting = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndAppointmentTime(a.getDoctor().getId(), newDate, newTime);
        if (conflicting) {
            throw PulseException.conflict("Double Booking", "Doctor already has an appointment at the new time");
        }

        a.setAppointmentDate(newDate);
        a.setAppointmentTime(newTime);
        a.setEndTime(newTime.plusMinutes(15));

        Appointment saved = appointmentRepository.save(a);
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long id) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Appointment not found"));
        a.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(a);
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse completeAppointment(Long id) {
        Appointment a = appointmentRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Appointment not found"));
        a.setStatus(AppointmentStatus.COMPLETED);
        Appointment saved = appointmentRepository.save(a);
        return toResponse(saved);
    }

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getAppointmentId())
                .appointmentId(a.getAppointmentId())
                .appointmentNumber(a.getAppointmentNumber())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getFullName())
                .patientNic(a.getPatient().getNicPassportNo())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getFullName())
                .specialization(a.getDoctor().getSpecialization())
                .appointmentDate(a.getAppointmentDate() != null ? a.getAppointmentDate().toString() : "")
                .startTime(a.getAppointmentTime() != null ? a.getAppointmentTime().toString() : "")
                .appointmentTime(a.getAppointmentTime() != null ? a.getAppointmentTime().toString() : "")
                .endTime(a.getEndTime() != null ? a.getEndTime().toString() : "")
                .status(a.getStatus() != null ? a.getStatus().name() : "SCHEDULED")
                .symptomsReason(a.getReasonForVisit())
                .reasonForVisit(a.getReasonForVisit())
                .roomNumber(a.getRoomNumber())
                .createdAt(a.getBookingDate() != null ? a.getBookingDate().toString() : "")
                .build();
    }
}
