package com.pulseos.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * PulseOS JWT Token Provider
 * Handles token generation, HMAC-SHA256 cryptographic signing, claims extraction,
 * and safe non-throwing token validation using JJWT 0.12.5.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    // 256-bit Base64-encoded default key for safe fallback in all environments
    private static final String DEFAULT_SECRET = "7J+fvdU7B4rwLPxxbxZpDocaYcCaypaMezPOJI5AlBc=";
    private static final long DEFAULT_EXPIRATION_MS = 86400000L; // 24 Hours

    @Value("${pulseos.jwt.secret:" + DEFAULT_SECRET + "}")
    private String jwtSecret;

    @Value("${pulseos.jwt.expiration-ms:" + DEFAULT_EXPIRATION_MS + "}")
    private long jwtExpirationMs;

    /**
     * Resolves the HMAC-SHA256 SecretKey from configured Base64 secret.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            byte[] decoded = Decoders.BASE64.decode(jwtSecret);
            if (decoded != null && decoded.length >= 32) {
                keyBytes = decoded;
            } else {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.warn("Failed to Base64-decode jwtSecret, falling back to UTF-8 bytes: {}", e.getMessage());
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generates a signed JWT with full PulseOS role and user identity claims.
     *
     * @param userId   User ID (Person PK)
     * @param username Email or login username
     * @param role     Role name (DOCTOR, PATIENT, RECEPTIONIST, PHARMACIST, LAB_TECHNICIAN, SYSTEM_ADMIN)
     * @param fullName User display name
     * @param userType User category ("STAFF" or "PATIENT")
     * @return Compact serialized JWT
     */
    public String generateToken(Long userId, String username, String role, String fullName, String userType) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("username", username)
                .claim("role", role)
                .claim("fullName", fullName)
                .claim("userType", userType)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Overload for generating tokens with custom claims map.
     */
    public String generateToken(String subject, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        var builder = Jwts.builder()
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate);

        if (extraClaims != null && !extraClaims.isEmpty()) {
            extraClaims.forEach(builder::claim);
        }

        return builder
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validates a JWT string safely without throwing unhandled exceptions.
     *
     * @param token JWT string to validate
     * @return true if valid and unexpired; false otherwise
     */
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("JWT token validation failed: token is null or empty");
            return false;
        }

        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("Invalid JWT signature or malformed token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty or invalid: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT token verification failed: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Parses and returns the token payload Claims.
     */
    public Claims getClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extracts username (subject) from token.
     */
    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    /**
     * Extracts role claim from token (e.g. "DOCTOR", "PATIENT").
     */
    public String getRoleFromToken(String token) {
        return getClaimsFromToken(token).get("role", String.class);
    }

    /**
     * Extracts userId claim with type safety against Jackson Integer/Long conversions.
     */
    public Long getUserIdFromToken(String token) {
        Object userId = getClaimsFromToken(token).get("userId");
        if (userId instanceof Number number) {
            return number.longValue();
        } else if (userId instanceof String str) {
            return Long.parseLong(str);
        }
        return null;
    }

    /**
     * Extracts fullName claim from token.
     */
    public String getFullNameFromToken(String token) {
        return getClaimsFromToken(token).get("fullName", String.class);
    }

    /**
     * Extracts userType claim from token ("STAFF" or "PATIENT").
     */
    public String getUserTypeFromToken(String token) {
        return getClaimsFromToken(token).get("userType", String.class);
    }

    /**
     * Extracts token expiration timestamp.
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimsFromToken(token).getExpiration();
    }

    /**
     * Helper to retrieve Spring Security GrantedAuthorities with ROLE_ prefix.
     */
    public List<SimpleGrantedAuthority> getAuthoritiesFromToken(String token) {
        String role = getRoleFromToken(token);
        if (role == null || role.isBlank()) {
            return Collections.emptyList();
        }
        String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return List.of(new SimpleGrantedAuthority(authority));
    }
}
