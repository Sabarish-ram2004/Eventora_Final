package com.eventora.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class EventoraException extends RuntimeException {
    private final HttpStatus status;

    public EventoraException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public static EventoraException notFound(String message) {
        return new EventoraException(message, HttpStatus.NOT_FOUND);
    }

    public static EventoraException badRequest(String message) {
        return new EventoraException(message, HttpStatus.BAD_REQUEST);
    }

    public static EventoraException unauthorized(String message) {
        return new EventoraException(message, HttpStatus.UNAUTHORIZED);
    }

    public static EventoraException forbidden(String message) {
        return new EventoraException(message, HttpStatus.FORBIDDEN);
    }

    public static EventoraException conflict(String message) {
        return new EventoraException(message, HttpStatus.CONFLICT);
    }
}
