package com.tfg.danielsantos.backend.controller.api.v1;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        // Validar autenticación
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Acceso autorizado");
        response.put("uid", authentication.getName());
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/profile")
    public ResponseEntity<Map<String, Object>> deleteAccount(HttpServletRequest request) throws FirebaseAuthException {
        String uid = SecurityContextHolder.getContext()
            .getAuthentication().getName();
        
        if (uid == null) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }
        
        // Si falla, se lanza FirebaseAuthException automáticamente
        firebaseAuth.deleteUser(uid);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Cuenta eliminada exitosamente"
        ));
    }
}