package com.tfg.danielsantos.backend.controller.api.v1;

import com.tfg.danielsantos.backend.dto.ApiResponse;
import com.tfg.danielsantos.backend.service.UserProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador para gestionar perfiles de usuario
 * 
 * @author Daniel Santos
 * @version 2.0
 */
@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {
    
    private static final Logger logger = LoggerFactory.getLogger(ProfileController.class);

    @Autowired
    private UserProfileService userProfileService;

    /**
     * Obtener el perfil del usuario actual
     * 
     * @param authentication Datos de autenticación del usuario actual
     * @return Datos del perfil del usuario
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        String uid = authentication.getName();
        logger.info("Solicitud de perfil para usuario: {}", uid);
        
        Map<String, Object> profile = userProfileService.getUserProfile(uid);
        
        return ResponseEntity.ok(new ApiResponse(true, "Perfil de usuario", profile));
    }
    
    /**
     * Actualizar el perfil del usuario actual
     * 
     * @param authentication Datos de autenticación del usuario actual
     * @param profileData Datos del perfil a actualizar
     * @return Perfil actualizado
     */
    @PutMapping
    public ResponseEntity<ApiResponse> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> profileData) {
            
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        String uid = authentication.getName();
        logger.info("Solicitud de actualización de perfil para usuario: {}", uid);
        
        Map<String, Object> updatedProfile = userProfileService.updateUserProfile(uid, profileData);
        
        return ResponseEntity.ok(new ApiResponse(true, "Perfil actualizado exitosamente", updatedProfile));
    }
}