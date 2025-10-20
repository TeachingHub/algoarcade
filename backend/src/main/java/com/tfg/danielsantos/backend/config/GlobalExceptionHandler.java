package com.tfg.danielsantos.backend.config;

import com.google.firebase.auth.FirebaseAuthException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones
 * 
 * Este controlador captura TODAS las excepciones que ocurran en cualquier 
 * controlador de la aplicación y las convierte en respuestas JSON consistentes.
 * 
 * @author Daniel Santos
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Errores específicos de Firebase Authentication
     */
    @ExceptionHandler(FirebaseAuthException.class)
    public ResponseEntity<Map<String, Object>> handleFirebaseAuthException(
            FirebaseAuthException ex, WebRequest request) {
        
        logger.error("Error de autenticación Firebase: {}", ex.getMessage());
        
        String errorCode = ex.getErrorCode() != null ? ex.getErrorCode().toString() : "UNKNOWN_ERROR";
        String userMessage = getUserFriendlyFirebaseMessage(errorCode);
        
        Map<String, Object> error = createErrorResponse(
            "Error de autenticación", 
            userMessage,
            HttpStatus.UNAUTHORIZED,
            request.getDescription(false)
        );
        
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Errores de validación (Bean Validation)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        logger.error("Error de validación: {}", ex.getMessage());
        
        // Extraer todos los errores de validación
        StringBuilder errorMessage = new StringBuilder("Errores de validación: ");
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errorMessage.append(error.getField())
                       .append(" - ")
                       .append(error.getDefaultMessage())
                       .append("; ");
        });
        
        Map<String, Object> error = createErrorResponse(
            "Error de validación", 
            errorMessage.toString(),
            HttpStatus.BAD_REQUEST,
            request.getDescription(false)
        );
        
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Errores de validación manual (IllegalArgumentException)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        logger.error("Argumento inválido: {}", ex.getMessage());
        
        Map<String, Object> error = createErrorResponse(
            "Datos inválidos", 
            ex.getMessage(),
            HttpStatus.BAD_REQUEST,
            request.getDescription(false)
        );
        
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    /**
     * Errores de acceso denegado (403)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        
        logger.error("Acceso denegado: {}", ex.getMessage());
        
        Map<String, Object> error = createErrorResponse(
            "Acceso denegado", 
            "No tienes permisos para realizar esta acción",
            HttpStatus.FORBIDDEN,
            request.getDescription(false)
        );
        
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    /**
     * Cualquier otra excepción no contemplada
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("Error interno del servidor", ex);
        
        Map<String, Object> error = createErrorResponse(
            "Error interno del servidor", 
            "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.",
            HttpStatus.INTERNAL_SERVER_ERROR,
            request.getDescription(false)
        );
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Respuesta de error estandarizada
     */
    private Map<String, Object> createErrorResponse(String title, String message, 
                                                   HttpStatus status, String path) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("error", title);
        error.put("message", message);
        error.put("status", status.value());
        error.put("statusText", status.getReasonPhrase());
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("path", path.replace("uri=", ""));
        return error;
    }

    /**
     * Convierte códigos de error de Firebase en mensajes amigables
     * 
     * @param errorCode El código de error como String
     * @return Mensaje amigable para el usuario
     */
    private String getUserFriendlyFirebaseMessage(String errorCode) {
        return switch (errorCode) {
            case "EMAIL_EXISTS" -> "Ya existe una cuenta con este email";
            case "EMAIL_NOT_FOUND" -> "No existe una cuenta con este email";
            case "INVALID_PASSWORD" -> "La contraseña es incorrecta";
            case "WEAK_PASSWORD" -> "La contraseña es muy débil. Debe tener al menos 6 caracteres";
            case "INVALID_EMAIL" -> "El formato del email no es válido";
            case "USER_DISABLED" -> "Esta cuenta ha sido deshabilitada";
            case "TOO_MANY_ATTEMPTS_TRY_LATER" -> "Demasiados intentos fallidos. Inténtalo más tarde";
            case "USER_NOT_FOUND" -> "Usuario no encontrado";
            case "EXPIRED_ID_TOKEN" -> "El token ha expirado. Por favor, inicia sesión de nuevo";
            case "INVALID_ID_TOKEN" -> "Token de autenticación inválido";
            case "REVOKED_ID_TOKEN" -> "El token ha sido revocado";
            case "UNKNOWN_ERROR" -> "Error desconocido de Firebase";
            default -> "Error de autenticación: " + errorCode;
        };
    }
}