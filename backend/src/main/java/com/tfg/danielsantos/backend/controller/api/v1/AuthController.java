package com.tfg.danielsantos.backend.controller.api.v1;

import com.tfg.danielsantos.backend.dto.ApiResponse;
import com.tfg.danielsantos.backend.dto.LoginRequest;
import com.tfg.danielsantos.backend.dto.RegisterRequest;
import com.tfg.danielsantos.backend.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador para la gestión de autenticación de usuarios
 * 
 * Gestiona todas las operaciones relacionadas con autenticación:
 * - Registro de nuevos usuarios
 * - Inicio de sesión (generación de tokens)
 * - Eliminación de cuentas de usuario
 * 
 * @author Daniel Santos
 * @version 2.0
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    /**
     * Registrar un nuevo usuario
     * 
     * @param request Datos de registro del nuevo usuario
     * @return Información del usuario registrado
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        logger.info("Solicitud de registro para: {}", request.getEmail());
        
        Map<String, Object> userData = authService.registerUser(request);
        
        return ResponseEntity.ok(new ApiResponse(true, "Usuario registrado exitosamente", userData));
    }

    /**
     * Iniciar sesión de usuario
     * 
     * @param request Credenciales de acceso
     * @return Token JWT y datos básicos del usuario
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        logger.info("Intento de login para: {}", request.getEmail());
        
        Map<String, Object> authData = authService.loginUser(request);
        
        return ResponseEntity.ok(new ApiResponse(true, "Login exitoso", authData));
    }

    /**
     * Eliminar cuenta de usuario
     * 
     * @param authentication Datos de autenticación del usuario actual
     * @return Información sobre la cuenta eliminada
     */
    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse> deleteAccount(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        String uid = authentication.getName();
        logger.info("Solicitud para eliminar cuenta de usuario: {}", uid);
        
        Map<String, Object> deletedUser = authService.deleteUser(uid);
        
        return ResponseEntity.ok(new ApiResponse(true, "Cuenta eliminada exitosamente", deletedUser));
    }
}
