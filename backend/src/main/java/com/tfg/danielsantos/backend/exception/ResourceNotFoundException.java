package com.tfg.danielsantos.backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceType, String identifier) {
        super(String.format("%s con identificador %s no encontrado", resourceType, identifier));
    }
}