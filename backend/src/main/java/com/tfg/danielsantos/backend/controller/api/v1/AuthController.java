package com.tfg.danielsantos.backend.controller.api.v1;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;
import com.google.firebase.auth.FirebaseToken;
import com.tfg.danielsantos.backend.dto.RegisterRequest;
import com.tfg.danielsantos.backend.dto.LoginRequest;
import com.tfg.danielsantos.backend.dto.ApiResponse;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador para la gestión de autenticación de usuarios
 * 
 * Gestiona todas las operaciones relacionadas con autenticación:
 * - Registro de nuevos usuarios
 * - Inicio de sesión (generación de custom tokens)
 * - Eliminación de cuentas de usuario
 * 
 * Rutas disponibles:
 * - POST /auth/register - Registrar nuevo usuario
 * - POST /auth/login - Iniciar sesión 
 * - DELETE /auth/delete - Eliminar cuenta (requiere autenticación)
 * 
 * @author Daniel Santos
 * @version 1.0
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private FirebaseAuth firebaseAuth;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${firebase.api.key}")
    private String firebaseApiKey;

    /**
     * Registrar un nuevo usuario en Firebase
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) throws FirebaseAuthException {
        // Crear el usuario en Firebase - si falla, se lanza FirebaseAuthException
        UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
            .setEmail(request.getEmail())
            .setPassword(request.getPassword())
            .setEmailVerified(false);

        if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
            createRequest.setDisplayName(request.getDisplayName());
        }

        UserRecord userRecord = firebaseAuth.createUser(createRequest);

        // Respuesta exitosa
        Map<String, Object> userData = Map.of(
            "uid", userRecord.getUid(),
            "email", userRecord.getEmail(),
            "displayName", userRecord.getDisplayName() != null ? userRecord.getDisplayName() : ""
        );

        return ResponseEntity.ok(new ApiResponse(true, "Usuario registrado exitosamente", userData));
    }

    /**
     * Iniciar sesión de usuario
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) throws Exception {
        // Autenticar con Firebase REST API
        String idToken = authenticateWithFirebase(request.getEmail(), request.getPassword());
        
        if (idToken == null) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        // Verificar token - si falla, se lanza FirebaseAuthException
        FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
        
        Map<String, Object> userData = Map.of(
            "uid", decodedToken.getUid(),
            "email", decodedToken.getEmail(),
            "displayName", decodedToken.getName() != null ? decodedToken.getName() : ""
        );

        return ResponseEntity.ok(new ApiResponse(true, "Login exitoso", Map.of("token", idToken, "user", userData)));
    }

    /**
     * Eliminar cuenta de usuario
     */
    @DeleteMapping("/delete")
    public ResponseEntity<ApiResponse> deleteAccount(Authentication authentication) throws FirebaseAuthException {
        // Verificar autenticación
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        String uid = authentication.getName();
    
        // Verificar que el usuario existe y eliminarlo
        UserRecord userRecord = firebaseAuth.getUser(uid);
        firebaseAuth.deleteUser(uid);

        // Respuesta exitosa
        Map<String, Object> deletedUser = Map.of(
            "uid", uid,
            "email", userRecord.getEmail()
        );

        return ResponseEntity.ok(new ApiResponse(true, "Cuenta eliminada exitosamente", deletedUser));
    }

    /**
     * Autentica con Firebase REST API y obtiene ID Token
     */
    private String authenticateWithFirebase(String email, String password) {
        try {
            String url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + firebaseApiKey;
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("email", email);
            payload.put("password", password);
            payload.put("returnSecureToken", true);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (String) response.getBody().get("idToken");
            }
            
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
