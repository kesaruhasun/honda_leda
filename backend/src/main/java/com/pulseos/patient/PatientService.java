package com.pulseos.patient;

import com.pulseos.notification.NotificationService;
import com.pulseos.notification.EmailNotification;
import java.time.LocalDateTime;
import com.pulseos.notification.NotificationService;

import com.pulseos.common.Gender;
import com.pulseos.common.PulseException;
import com.pulseos.patient.PatientDTOs.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final ArchivedPatientRepository archivedPatientRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients(String triagePriority, String search) {
        List<Patient> patients = patientRepository.findAll();

        if (triagePriority != null && !triagePriority.isBlank()) {
            try {
                TriagePriority tp = TriagePriority.valueOf(triagePriority.toUpperCase());
                patients = patients.stream()
                        .filter(p -> p.getTriagePriority() == tp)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {
            }
        }

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase().trim();
            patients = patients.stream()
                    .filter(p -> (p.getFirstName() != null && p.getFirstName().toLowerCase().contains(q)) ||
                                 (p.getLastName() != null && p.getLastName().toLowerCase().contains(q)) ||
                                 (p.getNicPassportNo() != null && p.getNicPassportNo().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        return patients.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(Long id) {
        Patient p = patientRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Patient with ID " + id + " not found"));
        return toResponse(p);
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientByNic(String nic) {
        Patient p = patientRepository.findByNicPassportNo(nic)
                .orElseThrow(() -> PulseException.notFound("Patient with NIC " + nic + " not found"));
        return toResponse(p);
    }

    @Transactional
    public PatientResponse createPatient(PatientRequest req) {
        String nic = req.getResolvedNic();
        String fName = req.getResolvedFirstName();
        String lName = req.getResolvedLastName();
        if (nic == null || nic.isBlank() || fName.isBlank() || lName.isBlank()) {
            throw PulseException.badRequest("Validation Failed", "Mandatory fields missing (NIC, firstName, and lastName are required)");
        }

        LocalDate dob = LocalDate.of(1990, 1, 1);
        String dobStr = req.getResolvedDob();
        if (dobStr != null && !dobStr.isBlank()) {
            try {
                dob = LocalDate.parse(dobStr);
                if (dob.isAfter(LocalDate.now())) {
                    throw PulseException.badRequest("Validation Failed", "Date of birth cannot be in the future");
                }
            } catch (PulseException pe) {
                throw pe;
            } catch (Exception e) {
                throw PulseException.badRequest("Validation Failed", "Invalid date format");
            }
        }

        if (patientRepository.findByNicPassportNo(nic).isPresent()) {
            throw PulseException.conflict("Duplicate NIC", "Patient with NIC " + nic + " already exists");
        }

        Patient patient = new Patient();
        patient.setNicPassportNo(nic);
        patient.setFirstName(fName);
        patient.setLastName(lName);
        patient.setEmail(req.getEmail() != null ? req.getEmail() : "");
        patient.setStreet(req.getAddress() != null ? req.getAddress() : "Colombo");
        patient.setCity("Colombo");
        patient.setPostalCode("10100");
        patient.setDateOfBirth(dob);

        Gender gender = Gender.OTHER;
        if (req.getGender() != null) {
            try {
                gender = Gender.valueOf(req.getGender().toUpperCase());
            } catch (Exception ignored) {}
        }
        patient.setGender(gender);

        String phone = req.getResolvedPhone();
        if (phone != null && !phone.isBlank()) {
            patient.setContactNumbers(new HashSet<>(Collections.singletonList(phone)));
        }

        BloodGroup bg = BloodGroup.UNKNOWN;
        if (req.getBloodGroup() != null) {
            try {
                String bgClean = req.getBloodGroup().replace("+", "_POSITIVE").replace("-", "_NEGATIVE").toUpperCase();
                bg = BloodGroup.valueOf(bgClean);
            } catch (Exception ignored) {}
        }
        patient.setBloodGroup(bg);

        TriagePriority tp = TriagePriority.ROUTINE;
        if (req.getTriagePriority() != null) {
            try {
                tp = TriagePriority.valueOf(req.getTriagePriority().toUpperCase());
            } catch (Exception ignored) {}
        }
        patient.setTriagePriority(tp);

        patient.setAllergies(req.getAllergies() != null ? req.getAllergies() : "None");
        patient.setEmergencyContactName(req.getEmergencyContactName() != null ? req.getEmergencyContactName() : "N/A");
        patient.setEmergencyContactPhone(req.getEmergencyContactPhone() != null ? req.getEmergencyContactPhone() : "N/A");
        patient.setEmergencyContactRelation(req.getEmergencyContactRelationship() != null ? req.getEmergencyContactRelationship() : "N/A");
        patient.setMedicalNotes(req.getMedicalNotes() != null ? req.getMedicalNotes() : "");
        patient.setPassword(req.getPassword() != null && !req.getPassword().isBlank() ? req.getPassword().trim() : "password");
        patient.setRegistrationDate(LocalDate.now());
        patient.setIsArchived(false);

        Patient saved = patientRepository.save(patient);
        log.info("Registered new patient: ID={}, NIC={}", saved.getId(), saved.getNicPassportNo());

        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            EmailNotification welcomeNotif = EmailNotification.builder()
                .to(saved.getEmail())
                .subject("Welcome to PulseOS - Account Created")
                .body("Hello " + saved.getFirstName() + " " + saved.getLastName() + ",\n\nWelcome to PulseOS Hospital Management System! Your patient account has been successfully created.\n\nYour NIC: " + saved.getNicPassportNo() + "\n\nYou can now log in to the Patient Portal to manage your appointments, lab reports, and prescriptions.\n\nBest Regards,\nThe PulseOS Team")
                .templateType("PATIENT_WELCOME")
                .build();
            try {
                notificationService.send(welcomeNotif);
            } catch (Exception e) {
                log.warn("Failed to send welcome email to {}: {}", saved.getEmail(), e.getMessage());
            }
        }

        return toResponse(saved);
    }

    @Transactional
    public PatientResponse updatePatient(Long id, PatientRequest req) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Patient with ID " + id + " not found"));

        String fName = req.getResolvedFirstName();
        if (fName != null && !fName.isBlank()) {
            patient.setFirstName(fName);
        }
        String lName = req.getResolvedLastName();
        if (lName != null && !lName.isBlank()) {
            patient.setLastName(lName);
        }
        if (req.getAddress() != null) {
            patient.setStreet(req.getAddress());
        }
        String phone = req.getResolvedPhone();
        if (phone != null && !phone.isBlank()) {
            patient.setContactNumbers(new HashSet<>(Collections.singletonList(phone)));
        }
        if (req.getEmail() != null) {
            patient.setEmail(req.getEmail());
        }
        if (req.getGender() != null && !req.getGender().isBlank()) {
            try {
                patient.setGender(Gender.valueOf(req.getGender().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (req.getBloodGroup() != null && !req.getBloodGroup().isBlank()) {
            try {
                String bgClean = req.getBloodGroup().replace("+", "_POSITIVE").replace("-", "_NEGATIVE").toUpperCase();
                patient.setBloodGroup(BloodGroup.valueOf(bgClean));
            } catch (Exception ignored) {}
        }
        String dobStr = req.getResolvedDob();
        if (dobStr != null && !dobStr.isBlank()) {
            try {
                LocalDate dob = LocalDate.parse(dobStr);
                patient.setDateOfBirth(dob);
            } catch (Exception ignored) {}
        }
        if (req.getAllergies() != null) {
            patient.setAllergies(req.getAllergies());
        }
        if (req.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(req.getEmergencyContactName());
        }
        if (req.getEmergencyContactPhone() != null) {
            patient.setEmergencyContactPhone(req.getEmergencyContactPhone());
        }
        if (req.getEmergencyContactRelationship() != null) {
            patient.setEmergencyContactRelation(req.getEmergencyContactRelationship());
        }
        if (req.getTriagePriority() != null) {
            try {
                patient.setTriagePriority(TriagePriority.valueOf(req.getTriagePriority().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (req.getMedicalNotes() != null) {
            patient.setMedicalNotes(req.getMedicalNotes());
        }

        Patient updated = patientRepository.save(patient);
        return toResponse(updated);
    }

    @Transactional
    public PatientResponse archivePatient(Long id, String reason, String archivedBy) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Patient not found"));
        patient.setIsArchived(true);
        Patient saved = patientRepository.save(patient);

        ArchivedPatient archived = ArchivedPatient.builder()
                .originalPatientId(patient.getId())
                .firstName(patient.getFirstName() != null ? patient.getFirstName() : "")
                .lastName(patient.getLastName() != null ? patient.getLastName() : "")
                .email(patient.getEmail() != null ? patient.getEmail() : "")
                .nicPassportNo(patient.getNicPassportNo())
                .contactNumber((patient.getContactNumbers() != null && !patient.getContactNumbers().isEmpty()) ? patient.getContactNumbers().iterator().next() : "")
                .gender(patient.getGender() != null ? patient.getGender().name() : "")
                .dateOfBirth(patient.getDateOfBirth())
                .city(patient.getCity() != null ? patient.getCity() : "Colombo")
                .bloodGroup(patient.getBloodGroup() != null ? patient.getBloodGroup().name() : "UNKNOWN")
                .emergencyContactName(patient.getEmergencyContactName())
                .emergencyContactPhone(patient.getEmergencyContactPhone())
                .emergencyContactRelation(patient.getEmergencyContactRelation())
                .allergies(patient.getAllergies())
                .medicalNotes(patient.getMedicalNotes())
                .archiveReason(reason != null && !reason.isBlank() ? reason : "Archived per clinical protocol")
                .archivedAt(LocalDateTime.now())
                .archivedBy(archivedBy != null && !archivedBy.isBlank() ? archivedBy : "Staff")
                .build();

        archivedPatientRepository.save(archived);
        return toResponse(saved);
    }

    @Transactional
    public PatientResponse archivePatient(Long id) {
        return archivePatient(id, "Archived per clinical protocol", "Staff");
    }

    @Transactional
    public PatientResponse restorePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> PulseException.notFound("Patient not found"));
        patient.setIsArchived(false);
        Patient saved = patientRepository.save(patient);

        archivedPatientRepository.deleteByOriginalPatientId(id);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ArchivedPatient> getArchivedPatients() {
        return archivedPatientRepository.findAllByOrderByArchivedAtDesc();
    }

    public PatientResponse toResponse(Patient p) {
        String phone = (p.getContactNumbers() != null && !p.getContactNumbers().isEmpty())
                ? p.getContactNumbers().iterator().next() : "";
        String dob = p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : "";
        String bg = p.getBloodGroup() != null ? p.getBloodGroup().name() : "UNKNOWN";
        String triage = p.getTriagePriority() != null ? p.getTriagePriority().name() : "ROUTINE";
        boolean archived = Boolean.TRUE.equals(p.getIsArchived());

        return PatientResponse.builder()
                .id(p.getId())
                .nicPassportNo(p.getNicPassportNo())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .fullName(p.getFullName())
                .email(p.getEmail() != null ? p.getEmail() : "")
                .contactNumber(phone)
                .address(p.getStreet() != null ? p.getStreet() : "")
                .gender(p.getGender() != null ? p.getGender().name() : "OTHER")
                .dateOfBirth(dob)
                .bloodGroup(bg)
                .allergies(p.getAllergies())
                .emergencyContactName(p.getEmergencyContactName())
                .emergencyContactPhone(p.getEmergencyContactPhone())
                .emergencyContactRelationship(p.getEmergencyContactRelation())
                .triagePriority(triage)
                .medicalNotes(p.getMedicalNotes() != null ? p.getMedicalNotes() : "")
                .isArchived(archived)
                .registrationDate(p.getRegistrationDate() != null ? p.getRegistrationDate().toString() : "")
                .build();
    }
}
