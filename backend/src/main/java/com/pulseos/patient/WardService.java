package com.pulseos.patient;

import com.pulseos.common.PulseException;
import com.pulseos.patient.WardDTOs.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WardService {

    private final WardRepository wardRepository;
    private final PatientAdmissionRepository admissionRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<WardResponse> getAllWards() {
        return wardRepository.findAll().stream()
                .map(this::toWardResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WardResponse getWardById(Long wardId) {
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> PulseException.notFound("Ward with ID " + wardId + " not found"));
        return toWardResponse(ward);
    }

    @Transactional(readOnly = true)
    public List<AdmissionResponse> getActiveAdmissions() {
        return admissionRepository.findAll().stream()
                .filter(a -> a.getDischargeDate() == null)
                .map(this::toAdmissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AdmissionResponse> getAdmissionsByWard(Long wardId) {
        return admissionRepository.findByWardWardIdAndDischargeDateIsNull(wardId).stream()
                .map(this::toAdmissionResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdmissionResponse admitPatient(AdmissionRequest request) {
        if (request.getPatientId() == null || request.getWardId() == null) {
            throw PulseException.badRequest("Validation Error", "patientId and wardId are required");
        }

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> PulseException.notFound("Patient with ID " + request.getPatientId() + " not found"));

        // Check if patient is already actively admitted
        admissionRepository.findByPatientIdAndDischargeDateIsNull(patient.getId())
                .ifPresent(existing -> {
                    throw PulseException.conflict("Active Admission Exists",
                            "Patient is already admitted to ward: " + existing.getWard().getWardName() + " (Bed: " + existing.getBedNumber() + ")");
                });

        Ward ward = wardRepository.findById(request.getWardId())
                .orElseThrow(() -> PulseException.notFound("Ward with ID " + request.getWardId() + " not found"));

        if (ward.getCurrentOccupancy() >= ward.getBedCapacity()) {
            throw PulseException.conflict("Ward Capacity Exceeded",
                    "Ward '" + ward.getWardName() + "' is at full capacity (" + ward.getBedCapacity() + " beds)");
        }

        String bedNumber = request.getBedNumber() != null && !request.getBedNumber().isBlank()
                ? request.getBedNumber()
                : "BED-" + (ward.getCurrentOccupancy() + 1);

        // Check if bed is already occupied in this ward
        boolean bedOccupied = admissionRepository.findByWardWardIdAndDischargeDateIsNull(ward.getWardId()).stream()
                .anyMatch(a -> a.getBedNumber().equalsIgnoreCase(bedNumber));
        if (bedOccupied) {
            throw PulseException.conflict("Bed Occupied", "Bed " + bedNumber + " in " + ward.getWardName() + " is currently occupied");
        }

        PatientAdmission admission = new PatientAdmission();
        admission.setPatient(patient);
        admission.setWard(ward);
        admission.setBedNumber(bedNumber);
        admission.setAdmissionDate(LocalDateTime.now());

        // Increment occupancy
        ward.setCurrentOccupancy(ward.getCurrentOccupancy() + 1);
        wardRepository.save(ward);

        PatientAdmission saved = admissionRepository.save(admission);
        log.info("Patient {} admitted to {} on bed {}", patient.getFullName(), ward.getWardName(), bedNumber);

        return toAdmissionResponse(saved);
    }

    @Transactional
    public AdmissionResponse dischargePatient(Long admissionId) {
        PatientAdmission admission = admissionRepository.findById(admissionId)
                .orElseThrow(() -> PulseException.notFound("Admission record with ID " + admissionId + " not found"));

        if (admission.getDischargeDate() != null) {
            throw PulseException.badRequest("Already Discharged", "Patient was already discharged on " + admission.getDischargeDate());
        }

        admission.setDischargeDate(LocalDateTime.now());
        PatientAdmission saved = admissionRepository.save(admission);

        Ward ward = admission.getWard();
        if (ward != null && ward.getCurrentOccupancy() > 0) {
            ward.setCurrentOccupancy(ward.getCurrentOccupancy() - 1);
            wardRepository.save(ward);
        }

        log.info("Discharged admission ID: {}, Patient: {}, Ward: {}", admissionId,
                admission.getPatient().getFullName(), ward != null ? ward.getWardName() : "N/A");

        return toAdmissionResponse(saved);
    }

    private WardResponse toWardResponse(Ward w) {
        int cap = w.getBedCapacity() != null ? w.getBedCapacity() : 0;
        int occ = w.getCurrentOccupancy() != null ? w.getCurrentOccupancy() : 0;
        int avail = Math.max(0, cap - occ);
        double rate = cap > 0 ? Math.round((occ * 100.0 / cap) * 10.0) / 10.0 : 0.0;

        return WardResponse.builder()
                .id(w.getWardId())
                .wardName(w.getWardName())
                .wardType(w.getWardType() != null ? w.getWardType().name() : "")
                .bedCapacity(cap)
                .currentOccupancy(occ)
                .availableBeds(avail)
                .occupancyRate(rate)
                .build();
    }

    private AdmissionResponse toAdmissionResponse(PatientAdmission a) {
        return AdmissionResponse.builder()
                .id(a.getAdmissionId())
                .patientId(a.getPatient() != null ? a.getPatient().getId() : null)
                .patientName(a.getPatient() != null ? a.getPatient().getFullName() : "")
                .patientNic(a.getPatient() != null ? a.getPatient().getNicPassportNo() : "")
                .wardId(a.getWard() != null ? a.getWard().getWardId() : null)
                .wardName(a.getWard() != null ? a.getWard().getWardName() : "")
                .wardType(a.getWard() != null && a.getWard().getWardType() != null ? a.getWard().getWardType().name() : "")
                .bedNumber(a.getBedNumber())
                .admissionDate(a.getAdmissionDate())
                .dischargeDate(a.getDischargeDate())
                .status(a.getDischargeDate() == null ? "ACTIVE" : "DISCHARGED")
                .build();
    }
}
