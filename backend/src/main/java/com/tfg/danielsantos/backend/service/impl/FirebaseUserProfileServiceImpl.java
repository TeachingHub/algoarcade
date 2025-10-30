package com.tfg.danielsantos.backend.service.impl;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.auth.UserRecord.UpdateRequest;
import com.tfg.danielsantos.backend.exception.ResourceNotFoundException;
import com.tfg.danielsantos.backend.service.UserProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FirebaseUserProfileServiceImpl implements UserProfileService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseUserProfileServiceImpl.class);
    
    @Autowired
    private FirebaseAuth firebaseAuth;

    @Override
    public Map<String, Object> getUserProfile(String uid) throws ResourceNotFoundException {
        try {
            logger.debug("Obteniendo perfil de usuario: {}", uid);
            
            UserRecord userRecord = firebaseAuth.getUser(uid);
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("uid", userRecord.getUid());
            profile.put("email", userRecord.getEmail());
            profile.put("displayName", userRecord.getDisplayName() != null ? userRecord.getDisplayName() : "");
            profile.put("emailVerified", userRecord.isEmailVerified());
            profile.put("creationTime", userRecord.getUserMetadata().getCreationTimestamp());
            profile.put("lastSignIn", userRecord.getUserMetadata().getLastSignInTimestamp());
            
            logger.debug("Perfil de usuario recuperado exitosamente: {}", uid);
            return profile;
            
        } catch (FirebaseAuthException e) {
            logger.error("Error al obtener perfil de usuario {}: {}", uid, e.getMessage());
            throw new ResourceNotFoundException("Usuario", uid);
        }
    }

    @Override
    public Map<String, Object> updateUserProfile(String uid, Map<String, Object> profileData) 
            throws ResourceNotFoundException {
        try {
            logger.debug("Actualizando perfil de usuario: {}", uid);
            
            // Verificar que el usuario existe
            firebaseAuth.getUser(uid);
            
            // Crear solicitud de actualización
            UpdateRequest request = new UpdateRequest(uid);
            
            // Añadir campos a actualizar
            if (profileData.containsKey("displayName")) {
                request.setDisplayName((String) profileData.get("displayName"));
            }
            if (profileData.containsKey("photoUrl")) {
                request.setPhotoUrl((String) profileData.get("photoUrl"));
            }
            if (profileData.containsKey("emailVerified")) {
                request.setEmailVerified((Boolean) profileData.get("emailVerified"));
            }
            
            // Actualizar usuario
            UserRecord updatedUser = firebaseAuth.updateUser(request);
            
            // Crear respuesta
            Map<String, Object> updatedProfile = new HashMap<>();
            updatedProfile.put("uid", updatedUser.getUid());
            updatedProfile.put("email", updatedUser.getEmail());
            updatedProfile.put("displayName", updatedUser.getDisplayName() != null ? updatedUser.getDisplayName() : "");
            updatedProfile.put("emailVerified", updatedUser.isEmailVerified());
            updatedProfile.put("photoUrl", updatedUser.getPhotoUrl() != null ? updatedUser.getPhotoUrl() : "");
            
            logger.info("Perfil de usuario actualizado exitosamente: {}", uid);
            return updatedProfile;
            
        } catch (FirebaseAuthException e) {
            logger.error("Error al actualizar perfil de usuario {}: {}", uid, e.getMessage());
            throw new ResourceNotFoundException("Usuario", uid);
        }
    }
}