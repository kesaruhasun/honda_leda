package com.pulseos.security;

import lombok.*;

/**
 * Profile response payload for GET /api/v1/auth/me.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long userId;
    private String username;
    private String fullName;
    private String role;
    private String userType;
}
