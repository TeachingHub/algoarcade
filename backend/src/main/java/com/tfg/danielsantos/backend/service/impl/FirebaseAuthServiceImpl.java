package com.tfg.danielsantos.backend.service.impl;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.tfg.danielsantos.backend.dto.LoginRequest;
import com.tfg.danielsantos.backend.dto.RegisterRequest;
import com.tfg.danielsantos.backend.exception.AuthenticationException;
import com.tfg.danielsantos.backend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseAuthServiceImpl implements AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthServiceImpl.class);
    
    @Autowired
    private FirebaseAuth firebaseAuth;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${firebase.api.key}")
    private String firebaseApiKey;
    
    @Override
    public Map<String, Object> registerUser(RegisterRequest request) throws AuthenticationException {
        try {
            logger.debug("Iniciando registro de usuario con email: {}", request.getEmail());
            
            UserRecord.CreateRequest createRequest = new UserRecord.CreateRequest()
                .setEmail(request.getEmail())
                .setPassword(request.getPassword())
                .setEmailVerified(false);
                
            if (request.getDisplayName() != null && !request.getDisplayName().trim().isEmpty()) {
                createRequest.setDisplayName(request.getDisplayName());
            }
            
            UserRecord userRecord = firebaseAuth.createUser(createRequest);
            logger.info("Usuario registrado exitosamente con UID: {}", userRecord.getUid());
            
            return Map.of(
                "uid", userRecord.getUid(),
                "email", userRecord.getEmail(),
                "displayName", userRecord.getDisplayName() != null ? userRecord.getDisplayName() : ""
            );
        } catch (FirebaseAuthException e) {
            logger.error("Error al registrar usuario: {}", e.getMessage());
            String errorCode = e.getErrorCode() != null ? e.getErrorCode().name() : "UNKNOWN_ERROR";
            throw new AuthenticationException("Error al registrar usuario: " + e.getMessage(), errorCode, e);
        }
    }
    
    @Override
    public Map<String, Object> loginUser(LoginRequest request) throws AuthenticationException {
        try {
            logger.debug("Iniciando autenticación para usuario: {}", request.getEmail());
            
            String idToken = authenticateWithFirebase(request.getEmail(), request.getPassword());
            
            if (idToken == null) {
                logger.warn("Autenticación fallida para usuario: {}", request.getEmail());
                throw new AuthenticationException("Credenciales inválidas", "INVALID_CREDENTIALS");
            }
            
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
            logger.info("Usuario autenticado correctamente: {}", decodedToken.getUid());
            
            Map<String, Object> userData = Map.of(
                "uid", decodedToken.getUid(),
                "email", decodedToken.getEmail(),
                "displayName", decodedToken.getName() != null ? decodedToken.getName() : ""
            );
            
            return Map.of(
                "token", idToken,
                "user", userData
            );
        } catch (FirebaseAuthException e) {
            logger.error("Error al verificar token: {}", e.getMessage());
            String errorCode = e.getErrorCode() != null ? e.getErrorCode().name() : "UNKNOWN_ERROR";
            throw new AuthenticationException("Error de autenticación: " + e.getMessage(), errorCode, e);
        }
    }
    
    @Override
    public Map<String, Object> deleteUser(String uid) throws AuthenticationException {
        try {
            logger.debug("Iniciando eliminación de usuario con UID: {}", uid);
            
            UserRecord userRecord = firebaseAuth.getUser(uid);
            firebaseAuth.deleteUser(uid);
            
            logger.info("Usuario eliminado exitosamente: {}", uid);
            
            return Map.of(
                "uid", uid,
                "email", userRecord.getEmail()
            );
        } catch (FirebaseAuthException e) {
            logger.error("Error al eliminar usuario {}: {}", uid, e.getMessage());
            String errorCode = e.getErrorCode() != null ? e.getErrorCode().name() : "UNKNOWN_ERROR";
            throw new AuthenticationException("Error al eliminar usuario: " + e.getMessage(), errorCode, e);
        }
    }
    
    /**
     * Método privado para autenticar con la API REST de Firebase
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
            
            logger.warn("Autenticación con Firebase falló. Respuesta: {}", response.getStatusCode());
            return null;
        } catch (RestClientException e) {
            logger.error("Error en la comunicación con Firebase REST API: {}", e.getMessage());
            return null;
        }
    }
}