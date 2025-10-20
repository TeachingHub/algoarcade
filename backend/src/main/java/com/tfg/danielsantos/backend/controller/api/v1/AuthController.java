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
@CrossOrigin(origins = "*")
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
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) throws FirebaseAuthException {
        // Validaciones básicas - si fallan, se lanza IllegalArgumentException
        validateRegisterRequest(request);

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
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Usuario registrado exitosamente");
        response.put("user", Map.of(
            "uid", userRecord.getUid(),
            "email", userRecord.getEmail(),
            "displayName", userRecord.getDisplayName() != null ? userRecord.getDisplayName() : ""
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Iniciar sesión de usuario
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) throws Exception {
        // Validaciones - si fallan, se lanza IllegalArgumentException
        validateLoginRequest(request);

        // Autenticar con Firebase REST API
        String idToken = authenticateWithFirebase(request.getEmail(), request.getPassword());
        
        if (idToken == null) {
            throw new IllegalArgumentException("Credenciales inválidas");
        }

        // Verificar token - si falla, se lanza FirebaseAuthException
        FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Login exitoso");
        response.put("token", idToken);
        response.put("user", Map.of(
            "uid", decodedToken.getUid(),
            "email", decodedToken.getEmail(),
            "displayName", decodedToken.getName() != null ? decodedToken.getName() : ""
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * Eliminar cuenta de usuario
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteAccount(Authentication authentication) throws FirebaseAuthException {
        // Verificar autenticación
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        String uid = authentication.getName();
        
        // Verificar que el usuario existe y eliminarlo
        UserRecord userRecord = firebaseAuth.getUser(uid);
        firebaseAuth.deleteUser(uid);

        // Respuesta exitosa
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Cuenta eliminada exitosamente");
        response.put("deletedUser", Map.of(
            "uid", uid,
            "email", userRecord.getEmail()
        ));

        return ResponseEntity.ok(response);
    }

    // MÉTODOS PRIVADOS DE VALIDACIÓN

    private void validateRegisterRequest(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es requerido");
        }
        
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("El email es requerido");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es requerida");
        }
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

    // CLASES INTERNAS
    public static class RegisterRequest {
        private String email;
        private String password;
        private String displayName;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}
