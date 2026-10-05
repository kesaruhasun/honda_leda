package com.pulseos.landing;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

public class LandingDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandingStatsResponse {
        private int activeDoctorsCount;
        private int departmentsCount;
        private long satisfiedPatientsCount;
        private long testsAvailableCount;
        private List<String> featuredSpecialties;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeaturedDoctorResponse {
        private Long id;
        private String fullName;
        private String specialization;
        private String roomNumber;
        private BigDecimal consultationFee;
        private Boolean isAvailable;
    }
}
