package com.tfg.danielsantos.backend.controller;

import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(Authentication authentication) {
        try {
            FirebaseToken decodedToken = (FirebaseToken) authentication.getDetails();
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("uid", decodedToken.getUid());
            profile.put("email", decodedToken.getEmail());
            profile.put("name", decodedToken.getName());
            profile.put("verified", decodedToken.isEmailVerified());
            profile.put("picture", decodedToken.getPicture());
            profile.put("issuer", decodedToken.getIssuer());
            
            // Obtener claims adicionales si necesitas más información
            Map<String, Object> claims = decodedToken.getClaims();
            profile.put("authTime", claims.get("auth_time"));
            profile.put("signInProvider", claims.get("sign_in_provider"));
            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Token inválido o no autenticado");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/protected")
    public ResponseEntity<Map<String, Object>> protectedEndpoint(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "¡Acceso autorizado!");
        response.put("user", authentication.getName());
        response.put("authorities", authentication.getAuthorities());
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }
}