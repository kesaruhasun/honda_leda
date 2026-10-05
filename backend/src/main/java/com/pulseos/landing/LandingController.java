package com.pulseos.landing;

import com.pulseos.appointment.AppointmentRepository;
import com.pulseos.appointment.AppointmentStatus;
import com.pulseos.doctor.DepartmentRepository;
import com.pulseos.doctor.Doctor;
import com.pulseos.doctor.DoctorRepository;
import com.pulseos.laboratory.LabTestCatalog;
import com.pulseos.laboratory.LabTestCatalogRepository;
import com.pulseos.landing.LandingDTOs.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/landing")
@RequiredArgsConstructor
public class LandingController {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final LabTestCatalogRepository labTestCatalogRepository;

    @GetMapping("/stats")
    public ResponseEntity<LandingStatsResponse> getLandingStats() {
        List<Doctor> allDoctors = doctorRepository.findAll();
        List<Doctor> activeDoctors = allDoctors.stream()
                .filter(d -> !Boolean.FALSE.equals(d.getIsAvailable()))
                .collect(Collectors.toList());

        List<String> specs = allDoctors.stream()
                .map(Doctor::getSpecialization)
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.toList());

        long completedAppts = appointmentRepository.findByStatus(AppointmentStatus.COMPLETED).size();
        long deptCount = departmentRepository.count();
        long catalogCount = labTestCatalogRepository.count();

        LandingStatsResponse stats = LandingStatsResponse.builder()
                .activeDoctorsCount(activeDoctors.size())
                .departmentsCount(deptCount > 0 ? (int) deptCount : 6)
                .satisfiedPatientsCount(1540 + completedAppts)
                .testsAvailableCount(catalogCount)
                .featuredSpecialties(specs.isEmpty() ? List.of("Cardiology", "General Medicine") : specs)
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<FeaturedDoctorResponse>> getFeaturedDoctors() {
        List<FeaturedDoctorResponse> doctors = doctorRepository.findAll().stream()
                .map(d -> FeaturedDoctorResponse.builder()
                        .id(d.getId())
                        .fullName(d.getFullName())
                        .specialization(d.getSpecialization())
                        .roomNumber(d.getRoomNumber())
                        .consultationFee(d.getConsultationFee())
                        .isAvailable(d.getIsAvailable())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/lab-tests")
    public ResponseEntity<List<LabTestCatalog>> getFeaturedLabTests() {
        return ResponseEntity.ok(labTestCatalogRepository.findAll());
    }
}
