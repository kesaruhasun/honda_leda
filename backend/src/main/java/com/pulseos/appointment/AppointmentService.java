package com.pulseos.appointment;

import com.pulseos.appointment.AppointmentDTOs.*;
import com.pulseos.common.PulseException;
import com.pulseos.doctor.Doctor;
import com.pulseos.doctor.DoctorRepository;
import com.pulseos.doctor.DoctorSchedule;
import com.pulseos.doctor.DoctorScheduleRepository;
import com.pulseos.notification.NotificationService;
import com.pulseos.patient.Patient;
import com.pulseos.patient.PatientRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final NotificationService notificationService;

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

        // Send email notification
        if (patient.getEmail() != null && !patient.getEmail().isBlank()) {
            notificationService.sendAppointmentConfirmation(
                    patient.getEmail(),
                    patient.getFullName(),
                    doctor.getFullName(),
                    date.toString(),
                    time.toString(),
                    saved.getAppointmentNumber());
        }

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

    @Transactional(readOnly = true)
    public CalendarViewResponse getCalendarView(String role, Long patientId, Long doctorId) {
        if (role == null || role.isBlank()) {
            throw PulseException.badRequest("Validation Error", "Valid role parameter (PATIENT, DOCTOR, MANAGER) is required");
        }

        String normalizedRole = role.trim().toUpperCase();
        if (!List.of("PATIENT", "DOCTOR", "MANAGER", "RECEPTIONIST").contains(normalizedRole)) {
            throw PulseException.badRequest("Validation Error", "Valid role parameter (PATIENT, DOCTOR, MANAGER) is required");
        }

        if ("PATIENT".equals(normalizedRole)) {
            List<AppointmentResponse> myAppts = new ArrayList<>();
            if (patientId != null) {
                myAppts = appointmentRepository.findByPatientId(patientId).stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList());
            }

            List<CalendarSlotInfo> availableSlots = new ArrayList<>();
            List<Doctor> doctors = doctorRepository.findAll().stream()
                    .filter(d -> !Boolean.FALSE.equals(d.getIsAvailable()))
                    .collect(Collectors.toList());

            for (Doctor doc : doctors) {
                List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorId(doc.getId()).stream()
                        .filter(s -> !Boolean.FALSE.equals(s.getIsActive()))
                        .collect(Collectors.toList());

                for (DoctorSchedule s : schedules) {
                    availableSlots.add(CalendarSlotInfo.builder()
                            .doctorId(doc.getId())
                            .doctorName("Dr. " + doc.getFullName())
                            .specialization(doc.getSpecialization())
                            .dayOfWeek(s.getDayOfWeek())
                            .startTime(s.getStartTime() != null ? s.getStartTime().toString() : "")
                            .endTime(s.getEndTime() != null ? s.getEndTime().toString() : "")
                            .slotDurationMinutes(s.getSlotDurationMinutes() != null ? s.getSlotDurationMinutes() : 15)
                            .build());
                }
            }

            return CalendarViewResponse.builder()
                    .role("PATIENT")
                    .patientId(patientId)
                    .appointments(myAppts)
                    .availableSlots(availableSlots)
                    .build();
        }

        if ("DOCTOR".equals(normalizedRole)) {
            if (doctorId == null) {
                throw PulseException.badRequest("Validation Error", "doctorId parameter is required for DOCTOR calendar view");
            }

            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> PulseException.notFound("Doctor " + doctorId + " not found"));

            List<DoctorSchedule> schedules = doctorScheduleRepository.findByDoctorId(doctorId).stream()
                    .filter(s -> !Boolean.FALSE.equals(s.getIsActive()))
                    .collect(Collectors.toList());

            List<AppointmentResponse> queue = appointmentRepository.findByDoctorId(doctorId).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());

            return CalendarViewResponse.builder()
                    .role("DOCTOR")
                    .doctorId(doctorId)
                    .doctorName("Dr. " + doctor.getFullName())
                    .schedules(schedules)
                    .queue(queue)
                    .totalAppointments(queue.size())
                    .build();
        }

        // MANAGER / RECEPTIONIST
        List<DoctorSchedule> allSchedules = doctorScheduleRepository.findAll();
        List<Doctor> allDoctors = doctorRepository.findAll();

        List<DoctorLoadInfo> doctorLoad = allDoctors.stream().map(d -> {
            int count = appointmentRepository.findByDoctorId(d.getId()).size();
            return DoctorLoadInfo.builder()
                    .doctorId(d.getId())
                    .doctorName("Dr. " + d.getFullName())
                    .specialization(d.getSpecialization())
                    .appointmentCount(count)
                    .isAvailable(d.getIsAvailable())
                    .build();
        }).collect(Collectors.toList());

        int totalCount = (int) appointmentRepository.count();

        return CalendarViewResponse.builder()
                .role("MANAGER")
                .allSchedules(allSchedules)
                .totalAppointments(totalCount)
                .hospitalLoad("NORMAL")
                .doctorLoad(doctorLoad)
                .build();
    }

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getAppointmentId())
                .appointmentNumber(a.getAppointmentNumber())
                .patientId(a.getPatient().getId())
                .patientName(a.getPatient().getFullName())
                .patientNic(a.getPatient().getNicPassportNo())
                .doctorId(a.getDoctor().getId())
                .doctorName(a.getDoctor().getFullName())
                .specialization(a.getDoctor().getSpecialization())
                .appointmentDate(a.getAppointmentDate() != null ? a.getAppointmentDate().toString() : "")
                .appointmentTime(a.getAppointmentTime() != null ? a.getAppointmentTime().toString() : "")
                .endTime(a.getEndTime() != null ? a.getEndTime().toString() : "")
                .status(a.getStatus() != null ? a.getStatus().name() : "SCHEDULED")
                .reasonForVisit(a.getReasonForVisit())
                .roomNumber(a.getRoomNumber())
                .createdAt(a.getBookingDate() != null ? a.getBookingDate().toString() : "")
                .build();
    }
}
