package com.pulseos.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class PulseException extends RuntimeException {

    private final HttpStatus status;
    private final String error;

    public PulseException(HttpStatus status, String error, String message) {
        super(message);
        this.status = status;
        this.error = error;
    }

    public static PulseException notFound(String message) {
        return new PulseException(HttpStatus.NOT_FOUND, "Not Found", message);
    }

    public static PulseException badRequest(String error, String message) {
        return new PulseException(HttpStatus.BAD_REQUEST, error, message);
    }

    public static PulseException conflict(String error, String message) {
        return new PulseException(HttpStatus.CONFLICT, error, message);
    }
}
