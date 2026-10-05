package com.pulseos.security;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Strict zero-redundancy login request payload.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "Username or email is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
