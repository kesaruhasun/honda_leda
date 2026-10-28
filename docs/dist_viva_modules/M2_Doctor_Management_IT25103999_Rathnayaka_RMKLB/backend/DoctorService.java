package com.pulseos.doctor;

import com.pulseos.common.EmployeeRole;
import com.pulseos.common.EmploymentType;
import com.pulseos.common.Gender;
import com.pulseos.common.PersonRepository;
import com.pulseos.common.PulseException;
import com.pulseos.doctor.DoctorDTOs.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final DepartmentRepository departmentRepository;
    private final PersonRepository personRepository;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public List<DoctorResponse> getAllDoctors(String specialization) {
        List<Doctor> doctors;
        if (specialization != null && !specialization.isBlank()) {
            doctors = doctorRepository.findBySpecialization(specialization.trim());
        } else {
            doctors = doctorRepository.findAll();
        }
        return doctors.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorResponse getDoctorById(Long id) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Doctor " + id + " not found"));
        return toResponse(doc);
    }

    @Transactional
    public DoctorResponse createDoctor(DoctorRequest req) {
        String license = req.getResolvedLicense();
        if (license == null || license.isBlank() || req.getFirstName() == null || req.getFirstName().isBlank() ||
            req.getSpecialization() == null || req.getSpecialization().isBlank()) {
            throw PulseException.badRequest("Validation Error", "Required doctor fields missing");
        }

        if (req.getConsultationFee() != null && req.getConsultationFee().compareTo(BigDecimal.ZERO) < 0) {
            throw PulseException.badRequest("Invalid Fee", "Consultation fee cannot be negative");
        }

        if (doctorRepository.findByDoctorLicenseNo(license).isPresent()) {
            throw PulseException.conflict("Duplicate License", "Medical license already registered");
        }

        Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);
        if (dept == null) {
            dept = departmentRepository.save(new Department(null, "General", "Main Wing", new BigDecimal("1000000.00"), null, null));
        }

        Doctor doc = new Doctor();
        doc.setNicPassportNo("DOC-" + System.currentTimeMillis());
        doc.setFirstName(req.getFirstName().trim());
        doc.setLastName(req.getLastName() != null ? req.getLastName().trim() : "Doctor");

        String email = req.getEmail();
        if (email != null && !email.isBlank()) {
            email = email.trim().toLowerCase();
            if (personRepository.existsByEmail(email)) {
                throw PulseException.conflict("Duplicate Email", "An account with email '" + email + "' is already registered in the system.");
            }
            doc.setEmail(email);
        } else {
            String sanitizedFirst = req.getFirstName().trim().toLowerCase().replaceAll("[^a-z0-9]", "");
            String sanitizedLast = (req.getLastName() != null ? req.getLastName().trim().toLowerCase().replaceAll("[^a-z0-9]", "") : "doc");
            doc.setEmail("dr." + sanitizedFirst + "." + sanitizedLast + "." + (System.currentTimeMillis() % 100000) + "@pulseos.lk");
        }

        doc.setDoctorLicenseNo(license);
        doc.setSpecialization(req.getSpecialization());
        doc.setConsultationFee(req.getConsultationFee() != null ? req.getConsultationFee() : new BigDecimal("2000.00"));
        doc.setRoomNumber(req.getRoomNumber() != null ? req.getRoomNumber() : "Room 101");
        doc.setIsAvailable(req.getIsAvailable() != null ? req.getIsAvailable() : true);
        doc.setCity("Colombo");
        doc.setStreet("Hospital Avenue");
        doc.setDateOfBirth(LocalDate.of(1985, 1, 1));
        doc.setGender(Gender.OTHER);
        doc.setHireDate(LocalDate.now());
        doc.setDeptJoiningDate(LocalDate.now());
        doc.setSalary(new BigDecimal("250000.00"));
        doc.setEmploymentType(EmploymentType.FULL_TIME);
        doc.setEmployeeRole(EmployeeRole.DOCTOR);
        doc.setDepartment(dept);
        doc.setPasswordHash("$2a$10$defaultPulseOSDoctorPasswordHash");

        if (req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank()) {
            doc.setContactNumbers(new HashSet<>(Collections.singletonList(req.getPhoneNumber())));
        }

        Doctor saved = doctorRepository.save(doc);

        try {
            jdbcTemplate.update("UPDATE employees SET email = ? WHERE employee_id = ?", saved.getEmail(), saved.getId());
        } catch (Exception ex) {
            log.debug("Employee email sync: {}", ex.getMessage());
        }

        log.info("Created doctor: ID={}, License={}, Email={}", saved.getId(), saved.getDoctorLicenseNo(), saved.getEmail());
        return toResponse(saved);
    }

    @Transactional
    public DoctorResponse updateFee(Long id, BigDecimal fee) {
        if (fee == null || fee.compareTo(BigDecimal.ZERO) < 0) {
            throw PulseException.badRequest("Invalid Fee", "Consultation fee must be non-negative");
        }
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Doctor not found"));
        doc.setConsultationFee(fee);
        Doctor saved = doctorRepository.save(doc);
        return toResponse(saved);
    }

    @Transactional
    public DoctorResponse updateDoctor(Long id, DoctorRequest req) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Doctor with ID " + id + " not found"));
        if (req.getFirstName() != null) doctor.setFirstName(req.getFirstName());
        if (req.getLastName() != null) doctor.setLastName(req.getLastName());
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String newEmail = req.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(doctor.getEmail()) && personRepository.existsByEmail(newEmail)) {
                throw PulseException.conflict("Duplicate Email", "Email '" + newEmail + "' is already registered to another user.");
            }
            doctor.setEmail(newEmail);
            try {
                jdbcTemplate.update("UPDATE employees SET email = ? WHERE employee_id = ?", newEmail, doctor.getId());
            } catch (Exception ex) {
                log.debug("Employee email sync: {}", ex.getMessage());
            }
        }
        if (req.getPhoneNumber() != null) doctor.setContactNumbers(new java.util.HashSet<>(java.util.Collections.singletonList(req.getPhoneNumber())));
        if (req.getConsultationFee() != null) doctor.setConsultationFee(req.getConsultationFee());
        if (req.getSpecialization() != null) doctor.setSpecialization(req.getSpecialization());
        if (req.getRoomNumber() != null) doctor.setRoomNumber(req.getRoomNumber());
        return toResponse(doctorRepository.save(doctor));
    }

    @Transactional
    public DoctorResponse updateAvailability(Long id, Boolean isAvailable) {
        Doctor doc = doctorRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Doctor not found"));
        doc.setIsAvailable(Boolean.TRUE.equals(isAvailable));
        Doctor saved = doctorRepository.save(doc);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DoctorScheduleResponse> getSchedules(Long doctorId) {
        return doctorScheduleRepository.findByDoctorId(doctorId).stream()
                .map(this::toScheduleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorScheduleResponse createSchedule(Long doctorId, DoctorScheduleRequest req) {
        if (req.getDayOfWeek() == null || req.getDayOfWeek().isBlank() ||
            req.getStartTime() == null || req.getStartTime().isBlank() ||
            req.getEndTime() == null || req.getEndTime().isBlank()) {
            throw PulseException.badRequest("Validation Error", "Missing schedule time parameters");
        }

        LocalTime start = LocalTime.parse(req.getStartTime());
        LocalTime end = LocalTime.parse(req.getEndTime());
        if (!end.isAfter(start)) {
            throw PulseException.badRequest("Invalid Time", "End time must be after start time");
        }

        if (req.getSlotDurationMinutes() != null && req.getSlotDurationMinutes() <= 0) {
            throw PulseException.badRequest("Invalid Duration", "Slot duration must be positive");
        }

        DoctorSchedule sched = new DoctorSchedule();
        sched.setDoctorId(doctorId);
        sched.setDayOfWeek(req.getDayOfWeek().toUpperCase());
        sched.setStartTime(start);
        sched.setEndTime(end);
        sched.setMaxPatients(req.getMaxPatients() != null ? req.getMaxPatients() : 15);
        sched.setSlotDurationMinutes(req.getSlotDurationMinutes() != null ? req.getSlotDurationMinutes() : 15);
        sched.setIsActive(true);

        DoctorSchedule saved = doctorScheduleRepository.save(sched);
        return toScheduleResponse(saved);
    }

    @Transactional
    public void deleteSchedule(Long doctorId, Long scheduleId) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> PulseException.notFound("Schedule not found with ID: " + scheduleId));
        if (!schedule.getDoctorId().equals(doctorId)) {
            throw PulseException.badRequest("Schedule Mismatch", "Schedule does not belong to doctor ID: " + doctorId);
        }
        doctorScheduleRepository.delete(schedule);
        log.info("Deleted schedule ID: {} for Doctor ID: {}", scheduleId, doctorId);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Doctor not found with ID: " + id));
        doctor.setIsAvailable(false);
        doctorRepository.save(doctor);
        log.info("Deactivated/soft-deleted doctor ID: {}", id);
    }

    public DoctorResponse toResponse(Doctor d) {
        String phone = (d.getContactNumbers() != null && !d.getContactNumbers().isEmpty())
                ? d.getContactNumbers().iterator().next() : "0770000000";
        String deptName = d.getDepartment() != null ? d.getDepartment().getDepartmentName() : "Cardiology";
        Long deptId = d.getDepartment() != null ? d.getDepartment().getDepartmentId() : 1L;

        return DoctorResponse.builder()
                .id(d.getId())
                .firstName(d.getFirstName())
                .lastName(d.getLastName())
                .fullName(d.getFullName())
                .email(d.getEmail())
                .contactNumber(phone)
                .doctorLicenseNo(d.getDoctorLicenseNo())
                .specialization(d.getSpecialization())
                .consultationFee(d.getConsultationFee())
                .roomNumber(d.getRoomNumber() != null ? d.getRoomNumber() : "Room 204")
                .isAvailable(d.getIsAvailable() != null ? d.getIsAvailable() : true)
                .departmentId(deptId)
                .departmentName(deptName)
                .build();
    }

    public DoctorScheduleResponse toScheduleResponse(DoctorSchedule s) {
        return DoctorScheduleResponse.builder()
                .id(s.getId())
                .doctorId(s.getDoctorId())
                .dayOfWeek(s.getDayOfWeek())
                .startTime(s.getStartTime().toString())
                .endTime(s.getEndTime().toString())
                .maxPatients(s.getMaxPatients())
                .slotDurationMinutes(s.getSlotDurationMinutes())
                .isActive(s.getIsActive())
                .build();
    }
}
