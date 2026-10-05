package com.pulseos.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;
    private final String testSecret = "7J+fvdU7B4rwLPxxbxZpDocaYcCaypaMezPOJI5AlBc=";
    private final long testExpirationMs = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(tokenProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(tokenProvider, "jwtExpirationMs", testExpirationMs);
    }

    @Test
    @DisplayName("Successfully generate and validate a token for staff doctor")
    void testGenerateAndValidateStaffToken() {
        String token = tokenProvider.generateToken(
                101L,
                "doc.kavinda@pulseos.lk",
                "DOCTOR",
                "Dr. Kavinda Rathnayaka",
                "STAFF"
        );

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getUsernameFromToken(token)).isEqualTo("doc.kavinda@pulseos.lk");
        assertThat(tokenProvider.getRoleFromToken(token)).isEqualTo("DOCTOR");
        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo(101L);
        assertThat(tokenProvider.getFullNameFromToken(token)).isEqualTo("Dr. Kavinda Rathnayaka");
        assertThat(tokenProvider.getUserTypeFromToken(token)).isEqualTo("STAFF");
        assertThat(tokenProvider.getAuthoritiesFromToken(token))
                .extracting("authority")
                .containsExactly("ROLE_DOCTOR");
    }

    @Test
    @DisplayName("Successfully generate and validate a token for patient")
    void testGenerateAndValidatePatientToken() {
        String token = tokenProvider.generateToken(
                202L,
                "patient.kamal@gmail.com",
                "PATIENT",
                "Kamal Silva",
                "PATIENT"
        );

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getRoleFromToken(token)).isEqualTo("PATIENT");
        assertThat(tokenProvider.getUserTypeFromToken(token)).isEqualTo("PATIENT");
        assertThat(tokenProvider.getAuthoritiesFromToken(token))
                .extracting("authority")
                .containsExactly("ROLE_PATIENT");
    }

    @Test
    @DisplayName("Validate returns false for expired token without throwing exception")
    void testExpiredTokenHandling() {
        // Create a provider with negative expiration to simulate expired token
        JwtTokenProvider expiredProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(expiredProvider, "jwtSecret", testSecret);
        ReflectionTestUtils.setField(expiredProvider, "jwtExpirationMs", -5000L);

        String expiredToken = expiredProvider.generateToken(
                101L,
                "doc.kavinda@pulseos.lk",
                "DOCTOR",
                "Dr. Kavinda Rathnayaka",
                "STAFF"
        );

        assertThat(tokenProvider.validateToken(expiredToken)).isFalse();
    }

    @Test
    @DisplayName("Validate returns false for malformed or tampered token without throwing exception")
    void testMalformedAndTamperedTokens() {
        assertThat(tokenProvider.validateToken("not-a-token")).isFalse();
        assertThat(tokenProvider.validateToken("")).isFalse();
        assertThat(tokenProvider.validateToken(null)).isFalse();

        // Valid token tampered in payload
        String validToken = tokenProvider.generateToken(
                101L, "doc.kavinda@pulseos.lk", "DOCTOR", "Dr. Kavinda Rathnayaka", "STAFF"
        );
        String tamperedToken = validToken.substring(0, validToken.length() - 5) + "abcde";
        assertThat(tokenProvider.validateToken(tamperedToken)).isFalse();
    }

    @Test
    @DisplayName("Numeric userId extraction handles both Integer and Long representations")
    void testUserIdTypeSafety() {
        String token = tokenProvider.generateToken(
                55L, "test@pulseos.lk", "RECEPTIONIST", "Dila Perera", "STAFF"
        );

        Long userId = tokenProvider.getUserIdFromToken(token);
        assertThat(userId).isEqualTo(55L);
    }
}
