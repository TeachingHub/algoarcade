package com.tfg.danielsantos.backend.controller.api.v1;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.tfg.danielsantos.backend.dto.ApiResponse;  // Importa ApiResponse

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
    public ResponseEntity<ApiResponse> health() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(new ApiResponse(true, "Servidor funcionando correctamente", data));
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
    public ResponseEntity<ApiResponse> info() {
        Map<String, Object> data = new HashMap<>();
        data.put("name", "TFG Backend API");
        data.put("version", "1.0.0");
        data.put("apiVersion", "v1");
        data.put("description", "API para autenticación con Firebase");
        data.put("firebase", "configurado");
        data.put("security", "habilitado");
        
        return ResponseEntity.ok(new ApiResponse(true, "Información de la API", data));
    }
}