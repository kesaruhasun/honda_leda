package com.pulseos.security;

import lombok.*;

/**
 * Strict zero-redundancy authentication response payload conforming to PROJECT.md interface contract.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String tokenType; // "Bearer"
    private Long userId;
    private String username;
    private String fullName;
    private String role;     // "DOCTOR", "RECEPTIONIST", "PHARMACIST", "LAB_TECHNICIAN", "SYSTEM_ADMIN", "MANAGER", "PATIENT"
    private String userType; // "STAFF" or "PATIENT"
}
