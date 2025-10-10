package com.tfg.danielsantos.backend.controller.api.v1;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para endpoints públicos (no requieren autenticación)
 * 
 * Este controlador maneja las rutas públicas de la API.
 * Incluye health check e información básica del servicio.
 * 
 * Rutas disponibles:
 * - GET /api/v1/health - Estado del servidor
 * - GET /api/v1/info - Información de la API
 * 
 * @author Daniel Santos
 * @version 1.0
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class PublicController {

    /**
     * Health check del servidor
     * 
     * Endpoint para verificar que el servidor está funcionando correctamente.
     * Útil para monitoreo, balanceadores de carga y sistemas de despliegue.
     * 
     * @return Estado del servidor con timestamp
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Servidor funcionando correctamente");
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Información general de la API
     * 
     * Endpoint que devuelve información básica sobre la API,
     * versión y servicios configurados.
     * 
     * @return Información básica de la API
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "TFG Backend API");
        response.put("version", "1.0.0");
        response.put("apiVersion", "v1");
        response.put("description", "API para autenticación con Firebase");
        response.put("firebase", "configurado");
        response.put("security", "habilitado");
        
        return ResponseEntity.ok(response);
    }
}