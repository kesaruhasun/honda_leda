package com.pulseos.common;

import com.pulseos.doctor.Doctor;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PulseException.class)
    public ResponseEntity<Map<String, Object>> handlePulseException(PulseException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", ex.getError());
        body.put("message", ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", ex.getStatusCode().toString());
        body.put("message", ex.getReason() != null ? ex.getReason() : ex.getMessage());
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Validation Failed");
        String message = ex.getBindingResult().getFieldErrors().isEmpty()
                ? "Invalid request arguments"
                : ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityException(DataIntegrityViolationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        String msg = ex.getMessage() != null ? ex.getMessage() : "";
        if (msg.contains("uq_doctor_slot")) {
            body.put("error", "Double-Booking Conflict");
            body.put("message", "Doctor is already scheduled for another consultation at this slot");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
        }
        body.put("error", "Conflict");
        body.put("message", "Data integrity constraint violation: " + ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            org.springframework.security.access.AccessDeniedException ex,
            jakarta.servlet.http.HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Forbidden");
        body.put("message", "Access denied: You do not have permission to access this resource");
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("path", request.getRequestURI());
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler({
        org.springframework.security.authentication.BadCredentialsException.class,
        org.springframework.security.core.AuthenticationException.class
    })
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(
            Exception ex,
            jakarta.servlet.http.HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Unauthorized");
        body.put("message", ex.getMessage() != null && !ex.getMessage().isBlank() ? ex.getMessage() : "Invalid credentials");
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("path", request.getRequestURI());
        body.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Internal Server Error");
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
